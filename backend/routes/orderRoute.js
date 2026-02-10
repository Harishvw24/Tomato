import express from 'express';
import authMiddleware from '../middleware/auth.js';
// ✅ FIX 3: Import both placeOrder and verifyOrder
import { placeOrder, verifyOrder, userOrders, listOrders, updateOrderStatus } from '../controllers/orderController.js';

const orderRouter = express.Router();

orderRouter.post('/place', authMiddleware, placeOrder);
orderRouter.post('/verify', verifyOrder);
orderRouter.post('/userorders', authMiddleware, userOrders);
orderRouter.get('/list', listOrders);
orderRouter.put('/status/:orderId', updateOrderStatus);

export default orderRouter;