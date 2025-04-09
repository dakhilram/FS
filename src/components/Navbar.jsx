import React, { useState, useEffect, useRef } from "react";
import { Link, useNavigate } from "react-router-dom";
import "../styles/Navbar.css";
import { FaUserCircle } from "react-icons/fa";

const Navbar = () => {
  const [username, setUsername] = useState(localStorage.getItem("username"));
  const [isLoggedIn, setIsLoggedIn] = useState(localStorage.getItem("isLoggedIn") === "true");
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [showUserDropdown, setShowUserDropdown] = useState(false);

  const dropdownRef = useRef(null);
  const menuRef = useRef(null);
  const hamburgerRef = useRef(null);
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

    window.dispatchEvent(new Event("storage"));
    navigate("/login");
  };

  // ✅ Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setShowUserDropdown(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // ✅ Close menu if clicked outside
  useEffect(() => {
    const handleClickOutsideMenu = (event) => {
      if (
        isMenuOpen &&
        menuRef.current &&
        !menuRef.current.contains(event.target) &&
        hamburgerRef.current &&
        !hamburgerRef.current.contains(event.target)
      ) {
        setIsMenuOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutsideMenu);
    return () => {
      document.removeEventListener("mousedown", handleClickOutsideMenu);
    };
  }, [isMenuOpen]);

  // ✅ Navigation + close dropdowns
  const handleNavClick = (path) => {
    setIsMenuOpen(false);
    setShowUserDropdown(false);
    navigate(path);
  };

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
    setShowUserDropdown(false);
  };

  const toggleUserDropdown = () => {
    setShowUserDropdown(!showUserDropdown);
  };

  return (
    <nav className="navbar">
      <div className="logo">FS</div>

      {/* Hamburger Icon */}
      <div className="hamburger" ref={hamburgerRef} onClick={toggleMenu}>
        <span className="bar"></span>
        <span className="bar"></span>
        <span className="bar"></span>
      </div>

      {/* Nav Links + Profile Section */}
      <div className={`nav-links-container ${isMenuOpen ? "active" : ""}`} ref={menuRef}>
        <div className="nav-links">
          <Link to="/" onClick={() => handleNavClick("/")}>Home</Link>
          <div className="dropdown">
            <button className="dropbtn">Nature ▼</button>
            <div className="dropdown-content">
              <Link to="/nature/earthquake" onClick={() => handleNavClick("/nature/earthquake")}>Earthquakes</Link>
              <Link to="/nature/wildfire" onClick={() => handleNavClick("/nature/wildfire")}>Wildfires</Link>
              <Link to="/nature/hurricane" onClick={() => handleNavClick("/nature/hurricane")}>Hurricanes</Link>
              <Link to="/nature/tornado" onClick={() => handleNavClick("/nature/tornado")}>Tornados</Link>
            </div>
          </div>
          <Link to="/terrorism" onClick={() => handleNavClick("/terrorism")}>Terrorism</Link>
          <Link to="/alerts" onClick={() => handleNavClick("/alerts")}>Alerts</Link>
        </div>

        <div className="profile-section" ref={dropdownRef}>
          {isLoggedIn ? (
            <>
              <span className="username">{username}</span>
              <FaUserCircle className="user-icon" onClick={toggleUserDropdown} />
              {showUserDropdown && (
                <div className="profile-dropdown">
                  <button onClick={() => handleNavClick("/account")}>Account</button>
                  <button onClick={handleLogout}>Logout</button>
                </div>
              )}
            </>
          ) : (
            <>
              <FaUserCircle className="user-icon" onClick={toggleUserDropdown} />
              {showUserDropdown && (
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
