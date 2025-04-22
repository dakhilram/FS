import React from "react";
import "../styles/Earthquake.css";
import earthquakeImage from "../assets/eq.jpg";
import eqmagnitude from "../assets/Earthquake/eqmagnitude.png";
import eqscatter from "../assets/Earthquake/eqscatter.png";
import eqtrend from "../assets/Earthquake/eqtrend.png";
import eqscattergeo from "../assets/Earthquake/eqscattergeo.png";
import eqtop10 from "../assets/Earthquake/eqtop10.png";
import { useEffect } from "react";
import { useLocation } from "react-router-dom";

const Earthquake = () => {
  const location = useLocation();

useEffect(() => {
  if (location.hash === "#graphs") {
    setTimeout(() => {
      const el = document.getElementById("graphs");
      if (el) {
        const yOffset = -80; // Adjust based on your navbar height
        const y = el.getBoundingClientRect().top + window.pageYOffset + yOffset;
        window.scrollTo({ top: y, behavior: "smooth" });
      }
    }, 100); // Add slight delay to ensure DOM is ready
  }
}, [location]);
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
      <h2>🌍 How the Real-Time Earthquake Prediction Model Works</h2>
      <p className="intro-text">
        Our Real-Time Earthquake Prediction Model helps forecast potential earthquake activity across the globe by analyzing real-time seismic data from official sources like the USGS.
        <p>The model continuously gathers data every few minutes, including:</p>
        <ul>
          <li><strong>📍 Location (Latitude & Longitude)</strong> – Helps pinpoint seismic hotspots.</li>
          <li><strong>📏 Depth (in kilometers)</strong> – Shallow quakes often have stronger surface impacts.</li>
          <li><strong>📊 Magnitude</strong> – Indicates the strength of the earthquake.</li>
          <li><strong>🕒 Time Difference Between Events</strong> – Reveals clustering patterns or aftershock potential.</li>
        </ul>
        These features are processed through an advanced <strong>LSTM (Long Short-Term Memory)</strong> neural network — a type of machine learning model designed for sequence and time-based predictions. Trained on years of historical seismic activity, the model analyzes recent trends and forecasts where and when a new event might occur.
        <p>The model provides predictions such as:</p>
        <ul>
          <li><strong>⚠ Predicted Magnitude</strong></li>
          <li><strong>🌐 Estimated Location</strong></li>
          <li><strong>⏳ Time Until Potential Impact</strong></li>
        </ul>
        This allows users and emergency services to receive early warnings and take necessary precautions before a significant seismic event occurs.
      </p>

      {/* Section: Earthquake Trend Over Time */}
      <h2 id="graphs">📈 Earthquake Trends Over Time 📉</h2>
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


      <h2>🌍 Real-Time Data 🌍</h2>
      <p className="map-description">
      This is a snapshot of one of the prediction alerts made using real time data from USGS which changes with real values and time.</p>
      <div className="map-container">
        <iframe
          src={`${import.meta.env.BASE_URL}earthquake_map.html`}
          //src={"https://www.weather.gov/#"}
          title="Wildfire Prediction Map"
          className="wildfire-map"
          width="100%"
          height="600px"
          style={{ border: "none" }}
        >
        </iframe>
      </div>

    </div>
  );
};

export default Earthquake;
