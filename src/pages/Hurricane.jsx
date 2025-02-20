import React from "react";
import "../styles/Hurricane.css";
import hurricaneImage from "../assets/Hu.jpg";
import hutrend from "../assets/hurricane/hutrend.png";

const Hurricane = () => {
  return (
    <div className="nature-page">
      <h1>🌀 Hurricane Information 🌀</h1>
      
      {/* Main Hurricane Image */}
      <img src={hurricaneImage} alt="Hurricane" className="nature-image" />
      {/* Introduction */}
      <h2>🌊 What are Hurricanes?</h2>
      <p className="intro-text">
        Hurricanes are powerful tropical storms that form over warm ocean waters, 
        bringing extreme winds, heavy rainfall, and devastating storm surges to coastal regions.
        Hurricanes, also known as tropical cyclones, are large and powerful storm systems 
        that develop over warm ocean waters. These storms are characterized by strong winds, 
        heavy rainfall, storm surges, and flooding, causing devastating effects when they 
        make landfall in coastal regions.
      </p>

      
      {/* Hurricane Trend Chart */}
      <h2>📈 Hurricane Trends Over the Years 📉</h2>
      <div className="chart-container">
        <img src={hutrend} alt="Hurricane Trend" className="chart-image" />
        <p className="chart-description">
          The trend of hurricanes over the years shows fluctuations in hurricane occurrences, 
          with some years experiencing significantly higher storm activity. This variation is influenced 
          by factors such as ocean temperatures, atmospheric conditions, and climate change.
        </p>
      </div>
    </div>
  );
};

export default Hurricane;
