import React from "react";
import "../styles/Earthquake.css";
import earthquakeImage from "../assets/eq.jpg";
import eqmagnitude from "../assets/Earthquake/eqmagnitude.png";
import eqscatter from "../assets/Earthquake/eqscatter.png";
import eqtrend from "../assets/Earthquake/eqtrend.png";

const Earthquake = () => {
  return (
    <div className="nature-page">
      <h1>🌍 Earthquake Information 🌍</h1>

      {/* Main Earthquake Image */}
      <img src={earthquakeImage} alt="Earthquake" className="nature-image" />
      <p className="intro-text">
      Earthquakes are sudden shakings of the Earth's surface caused by the movement of tectonic plates. 
      These powerful natural events can trigger tsunamis, landslides, and significant structural damage, 
      posing a serious threat to human life and infrastructure.
      
      Earthquakes occur along fault lines, where plates move past each other, collide, or pull apart. 
      The energy stored beneath the Earth's crust is released suddenly, sending seismic waves through the ground. 
      The intensity of an earthquake depends on several factors, including depth, magnitude, and geological conditions.
      
      While some regions experience frequent minor tremors, others are at risk of major destructive earthquakes. 
      Scientists use seismographs to measure earthquakes and determine their magnitude using the Richter scale or the Moment Magnitude Scale (Mw).
      </p>
      
      

      {/* Section: Earthquake Trend Over Time */}
      <h2>📈 Earthquake Trends Over Time 📉</h2>
      <div className="chart-container">
        <img src={eqtrend} alt="Earthquake Trend" className="chart-image" />
        <p className="chart-description">
        Earthquake activity has increased significantly over the past two centuries. 
        This rise is due to both improved detection methods and increasing seismic activity in certain regions.
        
        Early records of earthquakes were limited, but advancements in seismology and technology have led to more accurate tracking. 
        In recent years, earthquakes with magnitude 6 or higher have become more frequent, raising concerns about the potential for 
        devastating seismic events in urban areas.
        </p>
      </div>

      {/* Section: Magnitude Distribution */}
      <h2>🌡️ Magnitude Distribution of Earthquakes 🌡️</h2>
      <div className="chart-container right-align">
        <p className="chart-description">
        The magnitude of an earthquake determines its energy release and destructive potential. 
        While most earthquakes range between magnitude 4 and 6, higher magnitude earthquakes (above 7) can cause catastrophic damage.
        
        The frequency distribution of magnitudes follows the Gutenberg-Richter law, 
        which suggests that smaller earthquakes are much more common than larger ones. 
        However, even moderate earthquakes can be devastating if they occur in densely populated areas.
        </p>
        <img src={eqmagnitude} alt="Earthquake Magnitude Distribution" className="chart-image" />
      </div>

      {/* Section: Depth vs. Magnitude */}
      <h2>🔎 Depth vs. Magnitude 🔎</h2>
      <div className="chart-container">
        <img src={eqscatter} alt="Depth vs Magnitude" className="chart-image" />
        <p className="chart-description">
        Earthquakes can be classified as shallow, intermediate, or deep, depending on their depth:
        Shallow earthquakes (0-100 km depth): Cause the most damage since they release energy close to the Earth's surface.
        Intermediate-depth earthquakes (100-300 km depth): Less destructive but can still cause strong ground shaking.
        Deep earthquakes (300+ km depth): Rarely felt on the surface, but they provide valuable data about Earth’s mantle and tectonic activity.
        Most high-magnitude earthquakes occur at shallow depths, which is why earthquake-prone regions like California, Japan, and Indonesia focus on building earthquake-resistant infrastructure.
        </p>
      </div>
    </div>
  );
};

export default Earthquake;
