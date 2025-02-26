import React from "react";
import "../styles/LoadingScreen.css"; // Make sure to create this CSS file

const LoadingScreen = () => {
  return (
    <div className="loading-overlay">
      <span className="loader"></span>
    </div>
  );
};

export default LoadingScreen;
