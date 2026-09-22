import mongoose from 'mongoose';

const orderSchema = new mongoose.Schema(
  {
    userId: { type: String, required: true },
    items: { type: Array, default: [] },
    type: { type: String, default: 'Delivery' },
    amount: { type: Number, required: true },
    address: { type: Object, required: true },
    status: { type: String, default: 'Food Processing'},
    date: { type: Date, default: Date.now()},
    payment:{type: Boolean, default : false},
  }
)

orderSchema.index({ userId: 1, date: -1 });
orderSchema.index({ date: -1 });

const orderModel = mongoose.model('Orders', orderSchema)|| mongoose.models.Order;

export default orderModel;