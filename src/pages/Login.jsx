import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import "../styles/Auth.css";

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setError(""); // Clear previous errors

    if (!email || !password) {
      setError("Email and password are required.");
      return;
    }

    try {
      const response = await axios.post(
        "http://localhost:5000/login", // ✅ Local Flask Backend
        { email, password },
        { withCredentials: false }
      );

      if (response.status === 200 && response.data.username) {
        localStorage.setItem("username", response.data.username);
        localStorage.setItem("isLoggedIn", "true");

        window.dispatchEvent(new Event("storage")); // Ensure navbar updates dynamically

        navigate("/");
      } else {
        setError("Invalid login credentials. Please try again.");
      }
    } catch (err) {
      console.error("Login Error:", err);
      if (err.response) {
        if (err.response.status === 401) {
          setError("Invalid email or password.");
        } else if (err.response.status === 404) {
          setError("Login endpoint not found. Ensure Flask is running.");
        } else {
          setError("An error occurred while logging in. Please try again.");
        }
      } else {
        setError("Server is not responding. Check if Flask is running.");
      }
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
