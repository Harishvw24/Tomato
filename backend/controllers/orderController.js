import orderModel from "../models/orderModel.js";
import userModel from "../models/userModel.js";
import Stripe from 'stripe';
import { deleteCachePattern, getCache, setCache } from "../services/cacheService.js";

const ORDER_CACHE_TTL_SECONDS = 30;
const USER_ORDER_CACHE_TTL_SECONDS = 60;

const invalidateOrderCaches = async () => {
    await deleteCachePattern("orders:*");
};

const placeOrder = async (req, res) => {
    const frontendUrl = process.env.CUSTOMER_URL || process.env.FRONTEND_URL;
    
    try {
        // ✅ FIX 1: Add null check for req.user
        if (!req.user || !req.user._id) {
            return res.status(401).json({
                success: false, 
                message: "User not authenticated. Please login first."
            });
        }
        
        // Initialize Stripe inside the function to ensure env vars are loaded
        if (!process.env.STRIPE_SECRET_KEY) {
            return res.json({success: false, message: "Stripe configuration error"});
        }
        
        const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);
        
        const newOrder = new orderModel({
            userId: req.user._id,
            items: req.body.items,
            amount: req.body.amount,
            address: req.body.address,
        })
        
        await newOrder.save();
        await userModel.findByIdAndUpdate(req.user._id, {cartData: {}});
        await invalidateOrderCaches();

        const line_items = req.body.items.map((item) => ({
            price_data: {
                currency: 'inr',
                product_data: {
                    name: item.name,
                },
                unit_amount: item.price * 100 * 90,
            },
            quantity: item.quantity,
        }));
        
        line_items.push({
            price_data: {
                currency: 'inr',
                product_data: {
                    name: 'Delivery Charges',
                },
                unit_amount: 2 * 100 * 90
            },
            quantity: 1,
        });

        const session = await stripe.checkout.sessions.create({
            line_items: line_items,
            mode: 'payment',
            success_url: `${frontendUrl}/verify?success=true&orderId=${newOrder._id}`,
            cancel_url: `${frontendUrl}/verify?success=false&orderId=${newOrder._id}`,
        });
        
        res.json({success: true, session_url: session.url});
        
    } catch(error) {
        console.log(error);
        res.json({success: false, message: "Something went wrong while placing order"});
    }
}

const verifyOrder = async (req, res) => {
    const {orderId, success} = req.body;
    try {
        // Handle both string and boolean values
        if(success === 'true' || success === true){
            await orderModel.findByIdAndUpdate(orderId, {payment: true});
            await invalidateOrderCaches();
            res.json({success:true, message:"Payment Successful"});
        } else {
            const result = await orderModel.findByIdAndDelete(orderId);
            if(result) {
                await invalidateOrderCaches();
                res.json({success:true, message:"Payment Failed, Order Cancelled"});
            } else {
                res.json({success:false, message:"Order not found"});
            }
        }
    }
    catch(error){
        console.log("Verify error:", error);
        res.json({success:false, message:"Error in verifying order"});
    }
}

//user orders from frontend

const userOrders = async (req, res) => {
     try{
        const cacheKey = `orders:user:${req.user._id}`;
        const cachedOrders = await getCache(cacheKey);

        if (cachedOrders) {
            return res.json({success:true, data: cachedOrders});
        }

        const orders = await orderModel.find({userId: req.user._id}).lean();
        await setCache(cacheKey, orders, USER_ORDER_CACHE_TTL_SECONDS);
        res.json({success:true, data: orders});
     }
     catch(error){
        console.log(error);
        res.json({success:false, message:"Error in fetching orders"});
     }
}

//list of orders for admin

const listOrders = async (req, res) => {
   try{
        const cacheKey = "orders:admin:list";
        const cachedOrders = await getCache(cacheKey);

        if (cachedOrders) {
            return res.json({success:true, data: cachedOrders});
        }

        const orders = await orderModel.find({}).sort({ date: -1 }).lean();
        await setCache(cacheKey, orders, ORDER_CACHE_TTL_SECONDS);
    res.json({success:true, data: orders});
   }
   catch(error){
    res.json({success:false, message:"Error in fetching all orders"});
   }
}

const customerSummary = async (req, res) => {
    try {
        const { date } = req.query;
        const orderFilter = {};

        if (date) {
            const start = new Date(`${date}T00:00:00.000Z`);
            const end = new Date(`${date}T23:59:59.999Z`);

            if (Number.isNaN(start.getTime())) {
                return res.json({ success: false, message: "Invalid date" });
            }

            orderFilter.date = { $gte: start, $lte: end };
        }

        const cacheKey = `orders:admin:summary:${date || "all"}`;
        const cachedSummary = await getCache(cacheKey);

        if (cachedSummary) {
            return res.json({ success: true, data: cachedSummary });
        }

        const [customers, orders] = await Promise.all([
            userModel.find({ role: "customer" }).select("name email provider").lean(),
            orderModel.find(orderFilter).sort({ date: -1 }).lean()
        ]);

        const ordersByCustomer = orders.reduce((groups, order) => {
            const customerId = String(order.userId);
            if (!groups[customerId]) groups[customerId] = [];
            groups[customerId].push(order);
            return groups;
        }, {});

        const summary = customers.map((customer) => ({
                ...customer,
                orders: ordersByCustomer[String(customer._id)] || []
            }));

        await setCache(cacheKey, summary, ORDER_CACHE_TTL_SECONDS);

        res.json({
            success: true,
            data: summary
        });
    } catch (error) {
        console.log(error);
        res.json({ success: false, message: "Error in fetching customer summaries" });
    }
}

const updateOrderStatus = async (req, res) => {
    try {
        const { orderId } = req.params;
        const { status } = req.body;

        if (!status) {
            return res.json({ success: false, message: "Status is required" });
        }

        const validStatuses = ["Food Processing", "confirmed", "preparing", "out for delivery", "delivered"];
        if (!validStatuses.includes(status)) {
            return res.json({ success: false, message: "Invalid status" });
        }

        const updated = await orderModel.findByIdAndUpdate(orderId, { status }, { new: true });
        if (!updated) {
            return res.json({ success: false, message: "Order not found" });
        }

        await invalidateOrderCaches();

        res.json({ success: true, message: "Order status updated", data: updated });
    } catch (error) {
        console.log(error);
        res.json({ success: false, message: "Error in updating order status" });
    }
}

export { placeOrder, verifyOrder, userOrders, listOrders, customerSummary, updateOrderStatus };