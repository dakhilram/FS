import React, { useState, useEffect, useRef } from "react";
import { Link, useNavigate } from "react-router-dom";
import "../styles/Navbar.css";
import { FaUserCircle } from "react-icons/fa";

const Navbar = () => {
  const [username, setUsername] = useState(null);
  const [showDropdown, setShowDropdown] = useState(false);
  const dropdownRef = useRef(null);
  const navigate = useNavigate();

  // ✅ Check if user is logged in on component mount and when localStorage changes
  useEffect(() => {
    const storedUser = localStorage.getItem("username");
    const isLoggedIn = localStorage.getItem("isLoggedIn");

    if (storedUser && isLoggedIn === "true") {
      setUsername(storedUser);
    }
  }, []);

  // ✅ Add an event listener to update username dynamically
  useEffect(() => {
    const updateUsername = () => {
      const storedUser = localStorage.getItem("username");
      const isLoggedIn = localStorage.getItem("isLoggedIn");

      if (storedUser && isLoggedIn === "true") {
        setUsername(storedUser);
      } else {
        setUsername(null);
      }
    };

    window.addEventListener("storage", updateUsername);
    return () => {
      window.removeEventListener("storage", updateUsername);
    };
  }, []);

  const handleLogout = () => {
    // ✅ Clear user session
    localStorage.removeItem("username");
    localStorage.removeItem("isLoggedIn");
    setUsername(null);
    setShowDropdown(false);

    // ✅ Redirect to login page
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
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

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
          {username ? (
            <>
              <span className="username">{username}</span>
              <FaUserCircle
                className="user-icon"
                onClick={() => setShowDropdown(!showDropdown)}
              />
              {showDropdown && (
                <div className="profile-dropdown">
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
                  <Link to="/login" className="dropdown-link">
                    Login
                  </Link>
                  <Link to="/register" className="dropdown-link">
                    Signup
                  </Link>
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
