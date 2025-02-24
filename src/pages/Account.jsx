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
        });

        setUser(response.data);
      } catch (err) {
        console.error("Error fetching user details:", err);
        setError("Failed to fetch user details.");
      }
    };
    fetchUserDetails();
  }, [navigate]);

  return (
    <div className="account-container">
      <h2 className="account-header">Account Settings</h2>
      {error && <p className="error">{error}</p>}

      {/* ✅ Container for Side-by-Side Cards */}
      <div className="account-card-container">
        
        {/* ✅ User Info Card */}
        <div className="account-card">
          <h3>Profile Info</h3>
          <p className="account-info"><strong>Username:</strong> {user.username}</p>
          <p className="account-info"><strong>Email:</strong> {user.email}</p>
          <p className="verification-status">
            <strong>Verification Status:</strong>{" "}
            <span className={user.isVerified ? "verified" : "not-verified"}>
              {user.isVerified ? "✔️ Verified" : "❌ Not Verified"}
            </span>
          </p>
        </div>

        {/* ✅ Change Password Card */}
        <div className="account-card">
          <h3>Change Password</h3>
          <form>
            <input
              type="password"
              placeholder="Current Password"
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
              required
            />
            <input
              type="password"
              placeholder="New Password"
              value={newPassword}
              onChange={(e) => {
                setNewPassword(e.target.value);
                setPasswordValid(
                  e.target.value.length >= 8 &&
                  /[A-Z]/.test(e.target.value) &&
                  /[a-z]/.test(e.target.value) &&
                  /\d/.test(e.target.value) &&
                  /[@#$%^&*!]/.test(e.target.value)
                );
              }}
              required
            />
            <button className="button update-password" disabled={!passwordValid}>
              Update Password
            </button>
          </form>
        </div>

        {/* ✅ Delete Account Card */}
        <div className="account-card">
          <h3>Delete Account</h3>
          <form>
            <input
              type="password"
              placeholder="Enter Password to Confirm"
              value={deletePassword}
              onChange={(e) => setDeletePassword(e.target.value)}
              required
            />
            <button className="button delete-account">
              Delete Account
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Account;
