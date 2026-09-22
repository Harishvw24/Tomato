import React, { useCallback, useEffect, useState } from 'react';
import api from '../../api/api';
import { toast } from 'react-toastify';
import './Customers.css';

const Customers = () => {
  const [customers, setCustomers] = useState([]);
  const [date, setDate] = useState('');
  const [loading, setLoading] = useState(true);

  const fetchCustomers = useCallback(async () => {
    setLoading(true);
    try {
      const response = await api.get('/api/order/customer-summary', {
        params: date ? { date } : {}
      });

      if (response.data.success) {
        setCustomers(response.data.data);
      } else {
        toast.error(response.data.message || 'Unable to load customers');
      }
    } catch {
      toast.error('Unable to load customers');
    } finally {
      setLoading(false);
    }
  }, [date]);

  useEffect(() => {
    fetchCustomers();
  }, [fetchCustomers]);

  const orderCount = customers.reduce((total, customer) => total + customer.orders.length, 0);
  const revenue = customers.reduce(
    (total, customer) => total + customer.orders.reduce((sum, order) => sum + order.amount, 0),
    0
  );

  return (
    <main className="customers add">
      <div className="customers-header">
        <div>
          <p className="customers-eyebrow">Customer activity</p>
          <h2>Customers</h2>
          <p className="customers-subtitle">Review customers and the orders placed by each one.</p>
        </div>
        <label className="date-filter">
          <span>Orders on</span>
          <input type="date" value={date} onChange={(event) => setDate(event.target.value)} />
        </label>
      </div>

      <div className="customer-summary">
        <div><span>Customers</span><strong>{customers.length}</strong></div>
        <div><span>Orders shown</span><strong>{orderCount}</strong></div>
        <div><span>Order value</span><strong>${revenue.toFixed(2)}</strong></div>
      </div>

      {loading ? <p className="customers-empty">Loading customers...</p> : customers.length === 0 ? (
        <p className="customers-empty">No customers found.</p>
      ) : (
        <div className="customer-list">
          {customers.map((customer) => (
            <section className="customer-card" key={customer._id}>
              <div className="customer-heading">
                <div>
                  <h3>{customer.name}</h3>
                  <p>{customer.email}</p>
                </div>
                <span>{customer.orders.length} {customer.orders.length === 1 ? 'order' : 'orders'}</span>
              </div>
              {customer.orders.length === 0 ? (
                <p className="no-orders">No orders in this view.</p>
              ) : (
                <div className="customer-orders">
                  {customer.orders.map((order) => (
                    <div className="customer-order" key={order._id}>
                      <div>
                        <strong>{order.items.map((item) => `${item.name} x ${item.quantity}`).join(', ')}</strong>
                        <small>{new Date(order.date).toLocaleDateString()} · {order.status}</small>
                      </div>
                      <strong>${Number(order.amount).toFixed(2)}</strong>
                    </div>
                  ))}
                </div>
              )}
            </section>
          ))}
        </div>
      )}
    </main>
  );
};

export default Customers;
