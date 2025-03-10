import React, { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import axios from "axios";
import "../styles/Auth.css";
import backgroundVideo from "../assets/1.mp4";

const API_BASE_URL = window.location.hostname === "localhost"
  ? "http://localhost:5000"
  : "https://fs-51ng.onrender.com"; 

const ResetPassword = () => {
  const { token } = useParams();
  const [password, setPassword] = useState("");
  const [passwordValidations, setPasswordValidations] = useState({
    length: false,
    uppercase: false,
    lowercase: false,
    number: false,
    specialChar: false
  });
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const validatePassword = (pass) => {
    setPasswordValidations({
      length: pass.length >= 8,
      uppercase: /[A-Z]/.test(pass),
      lowercase: /[a-z]/.test(pass),
      number: /\d/.test(pass),
      specialChar: /[@#$%^&*()!]/.test(pass)
    });
  };

  const handleResetPassword = async (e) => {
    e.preventDefault();
    try {
      await axios.post(`${API_BASE_URL}/reset-password`, { token, password });
      setMessage("✅ Password updated successfully. Redirecting...");
      setTimeout(() => navigate("/login"), 3000);
    } catch (err) {
      setError(err.response?.data?.message || "Something went wrong.");
    }
  };

  return (
    <div className="login-container">
      <video autoPlay loop muted className="background-video">
        <source src={backgroundVideo} type="video/mp4" />
      </video>
      <div className="auth-container">
        <h2>Reset Password</h2>
        {message && <p className="success">{message}</p>}
        {error && <p className="error">{error}</p>}
        <form onSubmit={handleResetPassword}>
          <input
            type="password"
            placeholder="Enter new password"
            required
            value={password}
            onChange={(e) => {
              setPassword(e.target.value);
              validatePassword(e.target.value);
            }}
          />
          <button type="submit" disabled={!Object.values(passwordValidations).every(Boolean)}>
            Update Password
          </button>
        </form>
        <p><a onClick={() => navigate("/login")}>Back to Login</a></p>
      </div>
    </div>
  );
};

export default ResetPassword;
