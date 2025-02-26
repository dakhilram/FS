import React from "react";
import "../styles/LoadingScreen.css";  // Make sure this file is created

const LoadingScreen = () => {
  return (
    <div className="loading-overlay">
      <img src={`${process.env.PUBLIC_URL}/assets/loading_animation.gif`} alt="Loading..." className="loading-gif" />
    </div>
  );
};

export default LoadingScreen;
