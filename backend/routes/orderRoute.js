import express from 'express';
import authMiddleware from '../middleware/auth.js';
import requireRole from '../middleware/requireRole.js';
// ✅ FIX 3: Import both placeOrder and verifyOrder
import { placeOrder, verifyOrder, userOrders, listOrders, customerSummary, updateOrderStatus } from '../controllers/orderController.js';

const orderRouter = express.Router();

orderRouter.post('/place', authMiddleware, placeOrder);
orderRouter.post('/verify', verifyOrder);
orderRouter.post('/userorders', authMiddleware, userOrders);
orderRouter.get('/list', authMiddleware, requireRole("admin"), listOrders);
orderRouter.get('/customer-summary', authMiddleware, requireRole("admin"), customerSummary);
orderRouter.put('/status/:orderId', authMiddleware, requireRole("admin"), updateOrderStatus);

export default orderRouter;