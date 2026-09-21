import React from 'react';
import './AdminLogin.css';

const AdminLogin = () => {
  const customerUrl = import.meta.env.VITE_CUSTOMER_URL || 'http://localhost:5180';

  return (
    <main className="admin-login">
      <div className="admin-login-panel">
        <p className="admin-login-eyebrow">Tomato admin</p>
        <h1>Sign in to continue</h1>
        <p>Use the customer app login and select the Admin role to access the dashboard.</p>
        <a href={customerUrl}>Return to login</a>
      </div>
    </main>
  );
};

export default AdminLogin;
