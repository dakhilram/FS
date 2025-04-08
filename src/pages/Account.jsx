import React, { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import "../styles/Account.css"; // Reuse your existing styles where applicable

const API_BASE_URL = window.location.hostname === "localhost"
  ? "http://localhost:5000"
  : "https://fs-51ng.onrender.com";

const Tab = ({ label, activeTab, setActiveTab }) => (
  <button
    className={`tab-button ${activeTab === label ? "active" : ""}`}
    onClick={() => setActiveTab(label)}
  >
    {label}
  </button>
);

const AccountTabLayout = () => {
  const [activeTab, setActiveTab] = useState("Profile");
  const [user, setUser] = useState({ username: "", email: "", isVerified: false });
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [deletePassword, setDeletePassword] = useState("");
  const [securityAlerts, setSecurityAlerts] = useState(true);
  const [newsUpdates, setNewsUpdates] = useState(true);
  const [subject, setSubject] = useState("");
  const [message, setMessage] = useState("");
  const [contactStatus, setContactStatus] = useState("");

  useEffect(() => {
    const fetchUserDetails = async () => {
      const storedUsername = localStorage.getItem("username");
      if (!storedUsername) return;

      const response = await axios.get(`${API_BASE_URL}/user-details`, {
        params: { username: storedUsername },
        withCredentials: true,
      });

      setUser(response.data);
      setSecurityAlerts(response.data.securityAlerts);
      setNewsUpdates(response.data.newsUpdates);
    };

    fetchUserDetails();
  }, []);

  const handleChangePassword = async (e) => {
    e.preventDefault();
    await axios.post(`${API_BASE_URL}/change-password`, {
      email: user.email,
      currentPassword,
      newPassword,
    }, { withCredentials: true });
    alert("Password updated successfully");
    setCurrentPassword("");
    setNewPassword("");
  };

  const navigate = useNavigate(); // Make sure this line is already present

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
      window.dispatchEvent(new Event("storage"));
      alert("Account deleted successfully!");
      navigate("/"); // or navigate("/") if you prefer landing page
    } catch (err) {
      console.error("Error deleting account:", err);
      alert("Failed to delete account.");
    }
  };


  const handleSavePreferences = async () => {
    await axios.post(`${API_BASE_URL}/update-preferences`, {
      email: user.email,
      securityAlerts,
      newsUpdates,
    }, { withCredentials: true });
    alert("Preferences saved");
  };

  const handleContactSubmit = async (e) => {
    e.preventDefault();
    await axios.post(`${API_BASE_URL}/contact`, {
      email: user.email,
      subject,
      message,
    }, { withCredentials: true });
    setContactStatus("Message sent!");
  };

  return (
    <div className="account-container">
      <h2 className="account-header">My Account</h2>
      <div className="tab-bar">
        {['Profile', 'Security', 'Preferences', 'Contact'].map(label => (
          <Tab key={label} label={label} activeTab={activeTab} setActiveTab={setActiveTab} />
        ))}
      </div>

      <div className="tab-content">
        {activeTab === "Profile" && (
          <div className="account-info-card">
            <h3>Username: {user.username}</h3>
            <h3>Email: {user.email}</h3>
            <h3 className={`verification-status ${user.isVerified ? "" : "not-verified"}`}>
              Verification: {user.isVerified ? "✔️ Verified" : "❌ Not Verified"}
            </h3>
          </div>
        )}

        {activeTab === "Security" && (
          <div>
            <div className="account-card">
              <h3>Change Password</h3>
              <form onSubmit={handleChangePassword}>
                <input type="password" placeholder="Current Password" value={currentPassword} onChange={(e) => setCurrentPassword(e.target.value)} required />
                <input type="password" placeholder="New Password" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} required />
                <button type="submit" className="button update-password">Reset Password</button>
              </form>
            </div>

            <div className="account-card">
              <h3>Delete Account</h3>
              <form onSubmit={handleDeleteAccount}>
                <input type="password" placeholder="Confirm Password" value={deletePassword} onChange={(e) => setDeletePassword(e.target.value)} required />
                <button type="submit" className="button delete-account">Delete</button>
              </form>
            </div></div>
        )}

        {activeTab === "Preferences" && (
          <div className="account-card">
            <h3>Notification Preferences</h3>
            <h3>Daily Weather Alerts</h3>
            <input
              type="text"
              placeholder="Enter ZIP code for daily alerts"
              value={user.zipcode || ""}
              onChange={(e) => setUser({ ...user, zipcode: e.target.value })}
            />
            <button
              className="button update-preferences"
              onClick={async () => {
                await axios.post(`${API_BASE_URL}/update-zipcode`, {
                  email: user.email,
                  zipcode: user.zipcode,
                }, { withCredentials: true });
                alert("ZIP code updated for daily alerts.");
              }}
            >
              Save ZIP
            </button>

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
            <button className="button update-preferences" onClick={handleSavePreferences}>Save Preferences</button>
          </div>
        )}

        {activeTab === "Contact" && (
          <div className="account-card contact-card">
            <h3>Contact Us</h3>
            <form onSubmit={handleContactSubmit}>
              <input type="text" placeholder="Subject" value={subject} onChange={(e) => setSubject(e.target.value)} required />
              <textarea placeholder="Message..." value={message} onChange={(e) => setMessage(e.target.value)} required></textarea>
              <button type="submit" className="button contact-btn">Send</button>
              {contactStatus && <p>{contactStatus}</p>}
            </form>
          </div>
        )}
      </div>
    </div>
  );
};

export default AccountTabLayout;
