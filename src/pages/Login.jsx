import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import LoadingScreen from "./LoadingScreen";
import "../styles/Auth.css";
import backgroundVideo from "../assets/1.mp4";

const API_BASE_URL = window.location.hostname === "localhost"
  ? "http://localhost:5000"
  : "https://fs-51ng.onrender.com";

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await axios.post(
        `${API_BASE_URL}/login`,
        { email, password },
        { withCredentials: true }
      );

      if (response.status === 200) {
        localStorage.setItem("username", response.data.username);
        localStorage.setItem("user_email", email);
        localStorage.setItem("isLoggedIn", "true");

        window.dispatchEvent(new Event("storage")); // ✅ Ensures Navbar updates

        navigate("/");
      }
    } catch (err) {
      console.error("Login Error:", err);
      setError(err.response?.data?.message || "Invalid login credentials.");
    }
    setLoading(false);
  };

  return (
    <div className="login-container">
      {/* Background Video */}
      <video autoPlay loop muted className="background-video">
        <source src={backgroundVideo} type="video/mp4" />    </video>

      {loading && <LoadingScreen />}
      <div className="auth-container">

        <h2>Login</h2>
        {error && <p className="error">{error}</p>}
        <form onSubmit={handleLogin}>
          <input type="email" placeholder="Email" required value={email} onChange={(e) => setEmail(e.target.value)} />
          <input type="password" placeholder="Password" required value={password} onChange={(e) => setPassword(e.target.value)} />
          <button type="submit">Login</button>
        </form>
        <p>Don't have an account? <a className="register-link" onClick={() => navigate("/register")}>Register</a></p>
        <p>
          <a className="forgot-password-link" onClick={() => navigate("/forgot-password")}>
            Forgot Password?
          </a>
        </p>

      </div>
    </div>
  );
};

export default Login;
