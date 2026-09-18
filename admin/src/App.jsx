import React from 'react'
import Navbar from './Components/Navbar/Navbar'
import Sidebar from './Components/Sidebar/Sidebar'
import {Routes, Route} from 'react-router-dom'
import Add from './Pages/Add/Add'
import List from './Pages/List/List'
import Orders from './Pages/Orders/Orders'
import { ToastContainer } from 'react-toastify';
import OAuthCallback from './Pages/OAuthCallback/OAuthCallback';
import ProtectedRoute from './Components/ProtectedRoute/ProtectedRoute';
import Customers from './Pages/Customers/Customers';
import AdminLogin from './Pages/Login/AdminLogin';
const App = () => {

  const url = import.meta.env.VITE_API_URL;

  return (
    <div>
      <ToastContainer />
      <Navbar />
      <hr />
      <div className="app-content">
        <Sidebar />
        <Routes>
          <Route path="/add" element={
            <ProtectedRoute>
              <Add url={url} />
            </ProtectedRoute>
          } />
          <Route path="/orders" element={
            <ProtectedRoute>
              <Orders url={url} />
            </ProtectedRoute>
          } />
          <Route path="/list" element={
            <ProtectedRoute>
              <List url={url} />
            </ProtectedRoute>
          } />
          <Route path="/customers" element={
            <ProtectedRoute>
              <Customers url={url} />
            </ProtectedRoute>
          } />
          <Route path="/login" element={<AdminLogin />} />
          <Route
            path="/oauth/callback"
            element={<OAuthCallback url={url} />}
          />
        </Routes>
      </div>
    </div>
  )
}

export default App