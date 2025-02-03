import React from "react";
import { Link } from "react-router-dom";
import "../styles/Navbar.css";

const Navbar = () => {
  return (
    <nav className="navbar">
      <div className="logo">FS</div>
      <div className="nav-links">
        <Link to="/">Home</Link>
        <Link to="/nature">Nature</Link>
        <Link to="/terrorism">Terrorism</Link>
        <Link to="/alerts">Alerts</Link>
      </div>
      <div className="auth-links">
        <Link to="/login" className="btn">Login</Link>
        <Link to="/register" className="btn">Signup</Link>
      </div>
    </nav>
  );
};

export default Navbar;
