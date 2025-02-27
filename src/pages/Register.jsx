import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import LoadingScreen from "./LoadingScreen";
import backgroundVideo from "../assets/3.mp4";
import "../styles/Register.css";

const API_BASE_URL = window.location.hostname === "localhost"
  ? "http://localhost:5000"
  : "https://fs-51ng.onrender.com";

const Register = () => {
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPasswordRules, setShowPasswordRules] = useState(false);
  const [error, setError] = useState("");
  const [emailSent, setEmailSent] = useState(false);
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();

  // ✅ Password validation state
  const [passwordValidations, setPasswordValidations] = useState({
    length: false,
    uppercase: false,
    lowercase: false,
    number: false,
    specialChar: false
  });

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

  const handleRegister = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await axios.post(
        `${API_BASE_URL}/signup`,
        { username, email, password },
        { withCredentials: true }
      );

      if (response.status === 201) {
        setEmailSent(true);
      }
    } catch (err) {
      console.error("Signup Error:", err);
      setError(err.response?.data?.message || "An error occurred. Please try again.");
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
      
      <h2>Register</h2>
      {error && <p className="error">{error}</p>}
      {emailSent ? (
        <p className="success-message">
          ✅ A verification email has been sent to <strong>{email}</strong>. 
          Please check your inbox and verify your email before logging in.
        </p>
      ) : (
        <form onSubmit={handleRegister}>
          <input 
            type="text" 
            placeholder="Username" 
            required 
            value={username} 
            onChange={(e) => setUsername(e.target.value)} 
          />
          <input 
            type="email" 
            placeholder="Email" 
            required 
            value={email} 
            onChange={(e) => setEmail(e.target.value)} 
          />
          <div className="password-container">
            <input 
              type="password" 
              placeholder="Password" 
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
            Signup
          </button>
        </form>
      )}
      <p>Already have an account? <a className="login-link" onClick={() => navigate("/login")}>Login</a></p>
    </div>
    </div>
  );
};

export default Register;
