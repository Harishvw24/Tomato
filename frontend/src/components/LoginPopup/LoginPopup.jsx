import React from 'react'
import './LoginPopup.css'
import { useState, useContext } from 'react'
import { assets } from '../../assets/assets'
import { StoreContext } from '../../Context/StoreContext'
import axios from 'axios'


const LoginPopup = ({ setShowLogin }) => {

  const [currState, setCurrState] = useState("Login");
  const [role, setRole] = useState("customer");
  const { url, setToken } = useContext(StoreContext);
  const [data, setData] = useState({
    name: "",
    email: "",
    password: ""
  });
  const onChangeHandler = (event) => {
    const name = event.target.name;
    const value = event.target.value;
    setData(data => ({ ...data, [name]: value }))
  }

  const onLogin = async (event) => {
    event.preventDefault();

    if (currState === "Sign Up" && role === "admin") {
      alert("Admin accounts must be created by an existing administrator.");
      return;
    }

    let newUrl = url;
    if (currState === "Login") {
      newUrl += "/api/user/login";
    }
    else {
      newUrl += "/api/user/register";
    }
    try {
      const response = await axios.post(
        `${newUrl}`,
        {
          ...data,
          requestedRole: role
        }
      );

      if (response.data.success) {
        const authenticatedUser = response.data.user;
        const authenticatedToken = response.data.token;

        if (!authenticatedUser || !authenticatedToken) {
          alert("The server returned an incomplete login response.");
          return;
        }

        if (authenticatedUser.role === "customer") {
          localStorage.setItem("token", authenticatedToken);
          setToken(authenticatedToken);
          setShowLogin(false);
        }

        if (authenticatedUser.role === "admin") {
          localStorage.setItem("adminToken", authenticatedToken);
          window.location.href =
            `${import.meta.env.VITE_ADMIN_URL}/orders`;
        }
      } else {
        alert(response.data.message || "Authentication failed");
      }
    } catch (error) {
      alert(error.response?.data?.message || "Unable to reach the authentication server");
    }
  }
  return (
    <div className="login-popup">
      <form onSubmit={onLogin} className="login-popup-container">
        <div className="login-popup-title">
          <h2>{currState}</h2>
          <img onClick={() => setShowLogin(false)} src={assets.cross_icon} alt="" />
        </div>
        <div className="login-popup-inputs">
          {currState === "Login" ? <></> : <input name='name' onChange={onChangeHandler} value={data.name} type='text' placeholder='Your name' required />}
          <input name='email' onChange={onChangeHandler} value={data.email} type='email' placeholder='Email address' required />
          <input name='password' onChange={onChangeHandler} value={data.password} type='password' placeholder='Password' required />
          {currState === "Login" && (
            <label className="login-popup-role">
              <span>Sign in as</span>
              <select
                value={role}
                onChange={(event) => setRole(event.target.value)}
              >
                <option value="customer">Customer</option>
                <option value="admin">Admin</option>
              </select>
            </label>
          )}
        </div>
        <button type="submit" className="login-popup-button">{currState === "Sign Up" ? "Create Account" : "Login"}</button>
        {currState === "Login" && (
          <button
            type="button"
            className="login-popup-button"
            onClick={() => {
              window.location.href = `${url}/api/user/google?role=${encodeURIComponent(role)}`;
            }}
          >
            Continue with Google
          </button>
        )}
        <div className="login-popup-condition">
          <input type="checkbox" required />
          <p>I agree to the Terms of Service and Privacy Policy</p>
        </div>
        {currState === "Login"
          ? <p>Create a new account? <span onClick={() => setCurrState("Sign Up")}>Click here</span></p>
          : <p>Already have an account? <span onClick={() => setCurrState("Login")}>Login here</span></p>}
      </form>
    </div>
  )
}
export default LoginPopup