import React from "react";
import { Link } from "react-router-dom"; // ✅ Use Link for proper routing
import "../styles/Hero.css"; // Import CSS

const Hero = () => {
  return (
    <div className="hero">
      <div className="hero-content">
        <h1>ForeSight</h1>
        <p>Predicting disasters ahead</p>
        <div className="buttons">
          <Link to="/login" className="btn">Login</Link> {/* ✅ Fix: Absolute Path */}
          <Link to="/register" className="btn">Signup</Link> {/* ✅ Fix: Absolute Path */}
        </div>
      </div>
    </div>
  );
};

export default Hero;
