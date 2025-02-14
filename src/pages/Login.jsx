import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import "../styles/Auth.css";

const API_BASE_URL = window.location.hostname === "localhost"
  ? "http://localhost:5000"  // ✅ Local development backend
  : "https://fs-51ng.onrender.com";  // ✅ Replace with your deployed backend URL

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();

    try {
      const response = await axios.post(
        `${API_BASE_URL}/login`,  // ✅ Dynamic backend URL
        { email, password },
        { withCredentials: true }  // ✅ Ensures authentication is handled correctly
      );

      if (response.status === 200) {
        localStorage.setItem("username", response.data.username);
        localStorage.setItem("isLoggedIn", "true");

        window.dispatchEvent(new Event("storage")); // ✅ Forces Navbar to update

        navigate("/");  // ✅ Redirects to Home
      }
    } catch (err) {
      console.error("Login Error:", err);
      setError(err.response?.data?.message || "Invalid login credentials.");
    }
  };

  return (
    <div className="auth-container">
      <h2>Login</h2>
      {error && <p className="error">{error}</p>}
      <form onSubmit={handleLogin}>
        <input type="email" placeholder="Email" required value={email} onChange={(e) => setEmail(e.target.value)} />
        <input type="password" placeholder="Password" required value={password} onChange={(e) => setPassword(e.target.value)} />
        <button type="submit">Login</button>
      </form>
      <p>Don't have an account? <a href="/register">Register</a></p>
    </div>
  );
};

export default Login;
