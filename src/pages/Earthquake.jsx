import React from "react";
import "../styles/Earthquake.css";
import earthquakeImage from "../assets/eq.jpg";
import eqmagnitude from "../assets/Earthquake/eqmagnitude.png";
import eqscatter from "../assets/Earthquake/eqscatter.png";
import eqtrend from "../assets/Earthquake/eqtrend.png";
import eqscattergeo from "../assets/Earthquake/eqscattergeo.png";
import eqtop10 from "../assets/Earthquake/eqtop10.png";

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
          A time series visualization displaying the monthly number of earthquakes over the years.
          The fluctuations in the graph highlight periods of increased seismic activity.
          Spikes in the data indicate years with higher-than-average earthquake occurrences.
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
          A scatter plot showing the relationship between earthquake depth and magnitude from 1995 to 2023.
          Darker colors indicate lower magnitudes, while lighter colors represent stronger earthquakes.
          Most earthquakes occur at shallow depths, but deeper ones still reach high magnitudes.</p>
      </div>

      {/* Section: Magnitude Distribution */}
      <h2>🌡️ Magnitude Distribution of Earthquakes 🌡️</h2>
      <div className="chart-container right-align">
        <p className="chart-description">
          This scatter plot represents the locations of recorded earthquakes based on latitude and longitude.
          The size and color of each point indicate the magnitude of the earthquake.
          As expected, most earthquakes occur along tectonic plate boundaries, such as the Pacific Ring of Fire,
          where intense seismic activity is common. This visualization highlights key earthquake-prone regions,
          including parts of the Americas, Asia, and the Pacific.
        </p>
        <img src={eqscattergeo} alt="Earthquake Magnitude Distribution" className="chart-image" />
      </div>

      {/* Section: Depth vs. Magnitude */}
      <h2>Highest Earthquakes</h2>
      <div className="chart-container">
        <img src={eqtop10} alt="Depth vs Magnitude" className="chart-image" />
        <p className="chart-description">
        A bar chart ranking the countries with the highest earthquake occurrences from 1995 to 2023. 
        Indonesia tops the list, followed by Papua New Guinea and Chile. 
        These regions are located along major tectonic plate boundaries, making them more prone to seismic activity.</p>
      </div>

    </div>
  );
};

export default Earthquake;
