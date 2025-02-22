import React, { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import axios from "axios";

const API_BASE_URL = window.location.hostname === "localhost"
  ? "http://localhost:5000"
  : "https://fs-51ng.onrender.com";

const VerifyEmail = () => {
  const [searchParams] = useSearchParams();
  const email = searchParams.get("email");
  const [message, setMessage] = useState("Verifying email...");
  const navigate = useNavigate();

  useEffect(() => {
    if (email) {
      axios.get(`${API_BASE_URL}/verify-email?email=${email}`)
        .then((response) => {
          setMessage("✅ Email verified successfully! Redirecting...");
          setTimeout(() => navigate("/login"), 3000);
        })
        .catch((error) => {
          setMessage("❌ Verification failed. Invalid or expired link.");
        });
    } else {
      setMessage("❌ No email found in the verification link.");
    }
  }, [email, navigate]);

  return (
    <div className="auth-container">
      <h2>Email Verification</h2>
      <p>{message}</p>
    </div>
  );
};

export default VerifyEmail;
