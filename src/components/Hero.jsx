import React from "react";
import "../styles/Hero.css"; // Import CSS

const Hero = () => {
  return (
    <div className="hero">
      <div className="hero-content">
        <h1>ForeSight</h1>
        <p>Predicting disasters ahead</p>
        <div className="buttons">
          <button className="btn">Login</button>
          <button className="btn">Signup</button>
        </div>
      </div>
    </div>
  );
};

export default Hero;
