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
    e.preventDefault(); // Prevent form refresh

    try {
      const response = await axios.post(
        "fs-backend-hcgfephuf9fmfqdm.canadacentral-01.azurewebsites.net/login",
        { email, password },
        { withCredentials: true }
      );
      

      const { username } = response.data;
      if (username) {
        localStorage.setItem("username", username);
        localStorage.setItem("isLoggedIn", "true");

        window.dispatchEvent(new Event("storage")); // Ensure dynamic navbar update

        navigate("/");
      } else {
        setError("Invalid login credentials. Please try again.");
      }
    } catch (err) {
      console.error("Login Error:", err);
      setError("An error occurred while logging in. Please try again.");
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
