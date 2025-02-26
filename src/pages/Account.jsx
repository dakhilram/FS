import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import LoadingScreen from "./LoadingScreen";  // Import Loading Screen
import "../styles/Account.css";

const API_BASE_URL = window.location.hostname === "localhost"
  ? "http://localhost:5000"
  : "https://fs-51ng.onrender.com";

const Account = () => {
  const [user, setUser] = useState({ username: "", email: "", isVerified: false });
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [deletePassword, setDeletePassword] = useState("");
  const [securityAlerts, setSecurityAlerts] = useState(true);
  const [newsUpdates, setNewsUpdates] = useState(true);
  const [subject, setSubject] = useState("");
  const [message, setMessage] = useState("");
  const [contactStatus, setContactStatus] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false); // ✅ Loading state
  const navigate = useNavigate();

  // ✅ Fetch User Details
  useEffect(() => {
    const fetchUserDetails = async () => {
      setLoading(true); // Show loading
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
      setLoading(false); // Hide loading
    };
    fetchUserDetails();
  }, [navigate]);

  // ✅ Handle Resend Verification Email
  const handleResendVerification = async () => {
    setLoading(true);
    try {
      await axios.post(`${API_BASE_URL}/resend-verification`, { email: user.email }, {
        withCredentials: true,
      });
      alert("Verification email sent successfully!");
    } catch (err) {
      console.error("Error resending verification email:", err);
      setError("Failed to resend verification email.");
    }
    setLoading(false);
  };

  // ✅ Handle Password Change
  const handleChangePassword = async (e) => {
    e.preventDefault();
    setLoading(true);
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
    setLoading(false);
  };

  // ✅ Handle Account Deletion
  const handleDeleteAccount = async (e) => {
    e.preventDefault();
    const confirmDelete = window.confirm("Are you sure you want to delete your account?");
    if (!confirmDelete) return;

    setLoading(true);
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
    setLoading(false);
  };

  // ✅ Handle Notification Preferences Update
  const handleSavePreferences = async () => {
    setLoading(true);
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
    setLoading(false);
  };

  // ✅ Handle Contact Us Form Submission
  const handleContactSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await axios.post(`${API_BASE_URL}/contact`, {
        email: user.email,
        subject,
        message,
      }, {
        withCredentials: true,
      });
      setContactStatus("Message sent successfully!");
      setSubject("");
      setMessage("");
    } catch (err) {
      console.error("Error sending message:", err);
      setContactStatus("Failed to send message.");
    }
    setLoading(false);
  };

  return (
    <div className="account-container">
      {loading && <LoadingScreen />} {/* ✅ Display loading animation when an action is in progress */}
      
      <h2 className="account-header">Account Settings</h2>
      {error && <p className="error">{error}</p>}

      {/* ✅ User Info Card - Centered & Bigger */}
      <div className="account-info-card">
        <h3>Username: {user.username}</h3> 
        <h3>Email: {user.email}</h3> 
        <h3 className={`verification-status ${user.isVerified ? "" : "not-verified"}`}>
          Verification: {user.isVerified ? "✔️ Verified" : "❌ Not Verified"}
        </h3>
        
        {!user.isVerified && (
          <button onClick={handleResendVerification} className="button update-preferences">
            Resend Verification Email
          </button>
        )}
      </div>

      {/* ✅ 3 Sections in a Row */}
      <div className="account-flex-container">
        {/* ✅ Change Password */}
        <div className="account-card">
          <h3>Change Password</h3>
          <form onSubmit={handleChangePassword}>
            <input type="password" placeholder="Current Password" value={currentPassword} onChange={(e) => setCurrentPassword(e.target.value)} required />
            <input type="password" placeholder="New Password" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} required />
            <button type="submit" className="button update-password">Reset Password</button>
          </form>
        </div>

        {/* ✅ Notification Preferences with Toggle Effect */}
        <div className="account-card">
          <h3>Notification Preferences</h3>
          <div className="toggle-container">
            <label className="toggle-label">
              Security Alerts
              <input type="checkbox" checked={securityAlerts} onChange={() => setSecurityAlerts(!securityAlerts)} />
              <span className="toggle-slider"></span>
            </label>

            <label className="toggle-label">
              News Updates
              <input type="checkbox" checked={newsUpdates} onChange={() => setNewsUpdates(!newsUpdates)} />
              <span className="toggle-slider"></span>
            </label>
          </div>
          <button className="button update-preferences" onClick={handleSavePreferences}>Save Preferences</button>
        </div>

        {/* ✅ Delete Account */}
        <div className="account-card">
          <h3>Delete Account</h3>
          <p> You cannot recover your account once deleted.</p>
          <form onSubmit={handleDeleteAccount}>
            <input type="password" placeholder="Confirm Password" value={deletePassword} onChange={(e) => setDeletePassword(e.target.value)} required />
            <button type="submit" className="button delete-account">Delete</button>
          </form>
        </div>
      </div>

      {/* ✅ Enlarged Contact Us Section */}
      <div className="account-card contact-card">
        <h3>Contact Us</h3>
        <form onSubmit={handleContactSubmit}>
          <input type="text" placeholder="Subject" value={subject} onChange={(e) => setSubject(e.target.value)} required />
          <textarea placeholder="Message..." value={message} onChange={(e) => setMessage(e.target.value)} required></textarea>
          <button type="submit" className="button contact-btn">Send</button>
          {contactStatus && <p className="contact-status">{contactStatus}</p>}
        </form>
      </div>
    </div>
  );
};

export default Account;
