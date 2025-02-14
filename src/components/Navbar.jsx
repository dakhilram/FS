import React, { useState, useEffect, useRef } from "react";
import { Link, useNavigate } from "react-router-dom";
import "../styles/Navbar.css";
import { FaUserCircle } from "react-icons/fa";

const Navbar = () => {
  const [username, setUsername] = useState(localStorage.getItem("username"));
  const [isLoggedIn, setIsLoggedIn] = useState(localStorage.getItem("isLoggedIn") === "true");
  const [showDropdown, setShowDropdown] = useState(false);
  const dropdownRef = useRef(null);
  const navigate = useNavigate();

  // ✅ Listen for login/logout changes
  useEffect(() => {
    const handleStorageChange = () => {
      setUsername(localStorage.getItem("username"));
      setIsLoggedIn(localStorage.getItem("isLoggedIn") === "true");
    };

    window.addEventListener("storage", handleStorageChange);
    return () => window.removeEventListener("storage", handleStorageChange);
  }, []);

  // ✅ Logout Function
  const handleLogout = () => {
    localStorage.removeItem("username");
    localStorage.removeItem("isLoggedIn");
    setUsername(null);
    setIsLoggedIn(false);

    window.dispatchEvent(new Event("storage")); // ✅ Force Navbar update
    navigate("/login");
  };

  // ✅ Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setShowDropdown(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // ✅ Handles navigation and closes dropdown
  const handleNavClick = (path) => {
    setShowDropdown(false);
    navigate(path);
  };

  return (
    <nav className="navbar">
      <div className="logo">FS</div>
      <div className="nav-links">
        <Link to="/">Home</Link>
        <div className="dropdown">
          <button className="dropbtn">Nature ▼</button>
          <div className="dropdown-content">
            <Link to="/nature/earthquake">Earthquakes</Link>
            <Link to="/nature/wildfire">Wildfires</Link>
            <Link to="/nature/hurricane">Hurricanes</Link>
            <Link to="/nature/tornado">Tornados</Link>
          </div>
        </div>
        <Link to="/terrorism">Terrorism</Link>
        <Link to="/alerts">Alerts</Link>
      </div>

      <div className="auth-links">
        <div className="profile-section" ref={dropdownRef}>
          {isLoggedIn ? (
            <>
              <span className="username">{username}</span>
              <FaUserCircle
                className="user-icon"
                onClick={() => setShowDropdown(!showDropdown)}
              />
              {showDropdown && (
                <div className="profile-dropdown">
                  <button onClick={() => handleNavClick("/account")}>Account</button>
                  <button onClick={handleLogout}>Logout</button>
                </div>
              )}
            </>
          ) : (
            <>
              <FaUserCircle
                className="user-icon"
                onClick={() => setShowDropdown(!showDropdown)}
              />
              {showDropdown && (
                <div className="profile-dropdown">
                  <button onClick={() => handleNavClick("/login")}>Login</button>
                  <button onClick={() => handleNavClick("/register")}>Signup</button>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
