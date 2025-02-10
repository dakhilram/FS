import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import "../styles/Account.css";

const Account = () => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const storedUsername = localStorage.getItem("username");
        if (!storedUsername) {
          navigate("/login"); // Redirect if not logged in
          return;
        }
        const response = await axios.get(
          `https://fs-51ng.onrender.com/user?username=${storedUsername}`
        );
        setUser(response.data);
      } catch (error) {
        console.error("Error fetching user data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchUserData();
  }, [navigate]);

  const handleLogout = () => {
    localStorage.removeItem("username");
    localStorage.removeItem("isLoggedIn");
    navigate("/login");
  };

  const handleDeleteAccount = async () => {
    if (window.confirm("Are you sure you want to delete your account?")) {
      try {
        await axios.delete(`https://fs-51ng.onrender.com/delete-user`, {
          data: { email: user.email },
        });
        handleLogout();
      } catch (error) {
        console.error("Error deleting account:", error);
      }
    }
  };

  if (loading) return <div className="loading-screen">Loading...</div>;

  return (
    <div className="account-container">
      <h1 className="account-title"><i>Account Summary</i></h1>
      <div className="account-box">
        <p><strong>Email:</strong> {user?.email || "Not Available"}</p>
        <p><strong>Email Verification:</strong> {user?.verified ? "Verified" : "Not Verified"}</p>
        <p>
          <strong>Password:</strong>
          <span className="reset-link"> Reset password </span>
        </p>
        <p className="delete-account" onClick={handleDeleteAccount}>
          Delete Account
        </p>
      </div>
    </div>
  );
};

export default Account;
