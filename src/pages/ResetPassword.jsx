import React, { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import axios from "axios";
import "../styles/Auth.css";
import backgroundVideo from "../assets/1.mp4";

const API_BASE_URL = window.location.hostname === "localhost"
  ? "http://localhost:5000"
  : "https://fs-51ng.onrender.com"; 

const ResetPassword = () => {
  const { token } = useParams(); // ✅ Extract token
  const [password, setPassword] = useState("");
  const [showPasswordRules, setShowPasswordRules] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [passwordValidations, setPasswordValidations] = useState({
    length: false,
    uppercase: false,
    lowercase: false,
    number: false,
    specialChar: false
  });
  const navigate = useNavigate();

  // ✅ Function to validate password dynamically
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
    if (!Object.values(passwordValidations).every(Boolean)) {
      setError("Password does not meet the required criteria.");
      return;
    }
    
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
          <div className="password-container">
            <input
              type="password"
              placeholder="Enter new password"
              required
              value={password}
              onChange={(e) => {
                setPassword(e.target.value);
                validatePassword(e.target.value);
              }}
              onFocus={() => setShowPasswordRules(true)}
              onBlur={() => setShowPasswordRules(false)}
            />
            {showPasswordRules && (
              <div className="password-rules">
                <p>Password must contain:</p>
                <ul>
                  <li className={passwordValidations.length ? "valid" : ""}>
                    {passwordValidations.length ? "✅" : "❌"} At least 8 characters
                  </li>
                  <li className={passwordValidations.uppercase ? "valid" : ""}>
                    {passwordValidations.uppercase ? "✅" : "❌"} At least one uppercase letter
                  </li>
                  <li className={passwordValidations.lowercase ? "valid" : ""}>
                    {passwordValidations.lowercase ? "✅" : "❌"} At least one lowercase letter
                  </li>
                  <li className={passwordValidations.number ? "valid" : ""}>
                    {passwordValidations.number ? "✅" : "❌"} At least one number
                  </li>
                  <li className={passwordValidations.specialChar ? "valid" : ""}>
                    {passwordValidations.specialChar ? "✅" : "❌"} At least one special character (@#$%^&*!)
                  </li>
                </ul>
              </div>
            )}
          </div>
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
