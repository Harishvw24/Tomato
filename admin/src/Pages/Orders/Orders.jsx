import React, { useEffect, useMemo, useState } from 'react'
import './Orders.css'
import api from '../../api/api'
import { toast } from 'react-toastify';
import { assets } from '../../assets/assets';

const Order = () => {
  const [orders, setOrders] = useState([]);
  const [date, setDate] = useState('');
  const [sortOrder, setSortOrder] = useState('newest');
  const deliveryStatuses = ['Food Processing', 'confirmed', 'preparing', 'out for delivery', 'delivered'];

  const visibleOrders = useMemo(() => orders
    .filter((order) => !date || new Date(order.date).toISOString().slice(0, 10) === date)
    .sort((first, second) => {
      const difference = new Date(first.date) - new Date(second.date);
      return sortOrder === 'newest' ? -difference : difference;
    }), [date, orders, sortOrder]);

  const fetchAllOrders = async () => {
    try {
      const response = await api.get('/api/order/list');
      if (response.data.success) {
        setOrders(response.data.data);
      } else {
        toast.error(response.data.message || 'Unable to load orders');
      }
    } catch (error) {
      toast.error(error.response?.data?.message || 'Unable to load orders');
    }
  };

  useEffect(() => {
    // The fetch updates state asynchronously after the request completes.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    fetchAllOrders();
  }, []);

  const statusHandler = async (event, orderId) => {
    try {
      const response = await api.put(`/api/order/status/${orderId}`, {
        status: event.target.value
      });
      if (response.data.success) {
        await fetchAllOrders();
      } else {
        toast.error(response.data.message || 'Unable to update order');
      }
    } catch (error) {
      toast.error(error.response?.data?.message || 'Unable to update order');
    }
  };

  return (
    <div className="order add">
      <div className="order-header">
        <div>
          <p className="order-eyebrow">Fulfillment</p>
          <h3>Order Page</h3>
        </div>
        <div className="order-filters">
          <label>
            <span>Order date</span>
            <input type="date" value={date} onChange={(event) => setDate(event.target.value)} />
          </label>
          <label>
            <span>Sort by</span>
            <select value={sortOrder} onChange={(event) => setSortOrder(event.target.value)}>
              <option value="newest">Newest first</option>
              <option value="oldest">Oldest first</option>
            </select>
          </label>
        </div>
      </div>
      <div className="order-list">
        {visibleOrders.length === 0 ? <p className="order-empty">No orders found for this date.</p> : visibleOrders.map((order) => (
          <div key={order._id} className="order-item">
            <img src={assets.parcel_icon} alt="" />
            <div>
              <p className="order-item-food">
                {order.items.map((item, index) => `${item.name} x ${item.quantity}${index === order.items.length - 1 ? '' : ', '}`)}
              </p>
              <p className="order-item-name">{order.address.firstName} {order.address.lastName}</p>
              <div className="order-item-address">
                <p>{order.address.street},</p>
                <p>{order.address.city}, {order.address.state}, {order.address.country}, {order.address.zipcode}</p>
              </div>
              <p className="order-item-phone">{order.address.phone}</p>
            </div>
            <p>Items: {order.items.length}</p>
            <div className="order-total">
              <p>${Number(order.amount).toFixed(2)}</p>
              <small>{new Date(order.date).toLocaleDateString()}</small>
            </div>
            <select onChange={(event) => statusHandler(event, order._id)} value={order.status}>
              {deliveryStatuses.map((status) => <option key={status} value={status}>{status}</option>)}
            </select>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Order
