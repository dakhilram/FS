import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import "../styles/Account.css";

const API_BASE_URL = window.location.hostname === "localhost"
  ? "http://localhost:5000"
  : "https://fs-51ng.onrender.com";

const Account = () => {
  const [user, setUser] = useState({ username: "", email: "", isVerified: false });
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [passwordValid, setPasswordValid] = useState(false);
  const [deletePassword, setDeletePassword] = useState("");
  const [securityAlerts, setSecurityAlerts] = useState(true);
  const [newsUpdates, setNewsUpdates] = useState(true);
  const [subject, setSubject] = useState("");
  const [message, setMessage] = useState("");
  const [contactStatus, setContactStatus] = useState("");
  const [error, setError] = useState("");
  const navigate = useNavigate();

  // ✅ Fetch User Details on Page Load
  useEffect(() => {
    const fetchUserDetails = async () => {
      try {
        const storedUsername = localStorage.getItem("username");
        if (!storedUsername) {
          navigate("/login");
          return;
        }

        const response = await axios.get(`${API_BASE_URL}/user-details`, {
          params: { username: storedUsername },
          withCredentials: true,
        });

        setUser(response.data);
        setSecurityAlerts(response.data.securityAlerts);
        setNewsUpdates(response.data.newsUpdates);
      } catch (err) {
        console.error("Error fetching user details:", err);
        setError("Failed to fetch user details.");
      }
    };
    fetchUserDetails();
  }, [navigate]);

  // ✅ Handle Resend Verification Email
  const handleResendVerification = async () => {
    try {
      await axios.post(`${API_BASE_URL}/resend-verification`, { email: user.email }, {
        withCredentials: true,
      });
      alert("Verification email sent successfully!");
    } catch (err) {
      console.error("Error resending verification email:", err);
      setError("Failed to resend verification email.");
    }
  };

  // ✅ Handle Password Validation
  const validateNewPassword = (pass) => {
    const isValid =
      pass.length >= 8 &&
      /[A-Z]/.test(pass) &&
      /[a-z]/.test(pass) &&
      /\d/.test(pass) &&
      /[@#$%^&*!]/.test(pass);
    setPasswordValid(isValid);
  };

  // ✅ Handle Password Update
  const handleChangePassword = async (e) => {
    e.preventDefault();
    if (!passwordValid) {
      setError("New password does not meet the security criteria.");
      return;
    }

    try {
      await axios.post(`${API_BASE_URL}/change-password`, {
        email: user.email,
        currentPassword,
        newPassword,
      }, {
        withCredentials: true,
      });

      alert("Password updated successfully!");
      setCurrentPassword("");
      setNewPassword("");
    } catch (err) {
      console.error("Error changing password:", err);
      setError("Failed to update password.");
    }
  };

  // ✅ Handle Account Deletion
  const handleDeleteAccount = async (e) => {
    e.preventDefault();
    const confirmDelete = window.confirm("Are you sure you want to delete your account?");
    if (!confirmDelete) return;

    try {
      await axios.post(`${API_BASE_URL}/delete-account`, {
        email: user.email,
        password: deletePassword,
      }, {
        withCredentials: true,
      });

      localStorage.removeItem("username");
      localStorage.removeItem("isLoggedIn");
      alert("Account deleted successfully!");
      navigate("/");
    } catch (err) {
      console.error("Error deleting account:", err);
      setError("Failed to delete account.");
    }
  };

  // ✅ Handle Notification Preferences Update
  const handleSavePreferences = async () => {
    try {
      await axios.post(`${API_BASE_URL}/update-preferences`, {
        email: user.email,
        securityAlerts,
        newsUpdates,
      }, {
        withCredentials: true,
      });
      alert("Preferences updated successfully!");
    } catch (err) {
      console.error("Error updating preferences:", err);
      setError("Failed to update preferences.");
    }
  };

  // ✅ Handle Contact Us Form Submission
  const handleContactSubmit = async (e) => {
    e.preventDefault();
  
    if (!subject || !message) {
      alert("Please enter both subject and message.");
      return;
    }
  
    try {
      const response = await axios.post(`${API_BASE_URL}/contact`, {
        email: user.email,
        subject,
        message,
      }, {
        withCredentials: true, // Ensures authentication is sent
      });
  
      alert(response.data.message);
      setSubject("");
      setMessage("");
    } catch (err) {
      console.error("Error sending message:", err);
      alert("Failed to send message. Please try again.");
    }
  };
  

  return (
    <div className="account-container">
      {/* ✅ User Info Card */}
      <div className="account-card">
        <h2 className="account-header">Account Settings</h2>
        {error && <p className="error">{error}</p>}
        <p className="account-info"><strong>Username:</strong> {user.username}</p>
        <p className="account-info"><strong>Email:</strong> {user.email}</p>
        <p className="verification-status">
          <strong>Verification Status:</strong>{" "}
          <span className={user.isVerified ? "verified" : "not-verified"}>
            {user.isVerified ? "✔️ Verified" : "❌ Not Verified"}
          </span>
        </p>
        {!user.isVerified && (
          <button onClick={handleResendVerification} className="button resend-btn">
            Resend Verification Email
          </button>
        )}
      </div>

      <div className="account-flex-container">
        {/* ✅ Change Password Card */}
        <div className="account-card">
          <h3>Change Password</h3>
          <form onSubmit={handleChangePassword}>
            <input type="password" placeholder="Current Password" value={currentPassword} onChange={(e) => setCurrentPassword(e.target.value)} required />
            <input type="password" placeholder="New Password" value={newPassword} onChange={(e) => { setNewPassword(e.target.value); validateNewPassword(e.target.value); }} required />
            <button type="submit" className="button update-password" disabled={!passwordValid}>Update Password</button>
          </form>
        </div>

        {/* ✅ Delete Account Card */}
        <div className="account-card">
          <h3>Delete Account</h3>
          <form onSubmit={handleDeleteAccount}>
            <input type="password" placeholder="Enter Password to Confirm" value={deletePassword} onChange={(e) => setDeletePassword(e.target.value)} required />
            <button type="submit" className="button delete-account">Delete Account</button>
          </form>
        </div>
      </div>

      {/* ✅ Notification Preferences Card */}
      <div className="account-card">
        <h3>Notification Preferences</h3>
        <div className="toggle-container">
          <label>
            <input type="checkbox" checked={securityAlerts} onChange={() => setSecurityAlerts(!securityAlerts)} />
            <span className="toggle"></span> Security Alerts
          </label>
          <label>
            <input type="checkbox" checked={newsUpdates} onChange={() => setNewsUpdates(!newsUpdates)} />
            <span className="toggle"></span> News Updates
          </label>
        </div>
        <button className="button update-preferences" onClick={handleSavePreferences}>Save Preferences</button>
      </div>

      {/* ✅ Contact Us Section */}
      <div className="account-card">
        <h3>Contact Us</h3>
        <form onSubmit={handleContactSubmit}>
          <input type="text" placeholder="Subject" value={subject} onChange={(e) => setSubject(e.target.value)} required />
          <textarea placeholder="Your message..." value={message} onChange={(e) => setMessage(e.target.value)} required></textarea>
          <button type="submit" className="button contact-btn">Send Message</button>
          {contactStatus && <p className="contact-status">{contactStatus}</p>}
        </form>
      </div>
    </div>
  );
};

export default Account;
