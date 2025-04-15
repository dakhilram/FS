import React from "react";
import "../styles/Hurricane.css";
import hurricaneImage from "../assets/Hu.jpg";
import hutrend from "../assets/hurricane/hutrend.png";
import hudamage from "../assets/hurricane/hudamage.png";
import hudeath from "../assets/hurricane/hudeath.png";

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
        that develop over warm ocean waters. These storms are characterized by intense winds,
        heavy rainfall, storm surges, and flooding, causing devastating effects when they
        make landfall in coastal regions.
      </p>

      <h2>🧠 How the Hurricane Prediction Model Works</h2>
      <p className="intro-text">
        Our Hurricane Prediction Model forecasts the potential for hurricane activity using weather data for your ZIP code. It focuses on analyzing the kind of atmospheric conditions that typically lead to hurricanes.
        <p>The model uses:
        <ul>
          <li><strong>Wind Speed</strong> – Strong sustained winds are key hurricane indicators.</li>
          <li><strong>Atmospheric Pressure</strong> – Lower pressure often signals a developing hurricane.</li>
          <li><strong>Humidity</strong> – High humidity fuels storm systems.</li>
        </ul></p>
        A <strong>Logistic Regression</strong> model (a simple AI model) uses these inputs to classify:
        <ul>
          <li><strong>0</strong> – No Hurricane Risk</li>
          <li><strong>1</strong> – Hurricane Risk Detected</li>
        </ul>
        This model was trained using synthetic weather data that simulates hurricane conditions across the U.S. If the model predicts a risk in your area, you'll be notified with an alert on-screen and via email (if signed in). This helps individuals prepare for potential storms in advance.
      </p>


      {/* Hurricane Trend Chart */}
      <h2>📈 Hurricane Trends Over the Years 📉</h2>
      <div className="chart-container">
        <img src={hutrend} alt="Hurricane Trend" className="chart-image" />
        <p className="chart-description">
          The line graph illustrates the trend of hurricanes per year from 1921 to the present.
          It shows fluctuations in hurricane occurrences, with some years experiencing significantly more hurricanes than others.
          There are periods of increased hurricane activity, possibly due to climate patterns like El Niño and La Niña.
          The dynamically spaced x-axis provides a clear visualization of hurricane frequency over time.
          The graph suggests a fluctuating but persistent occurrence of hurricanes over the years, with some years witnessing extreme hurricane activity. This trend highlights the need for continuous monitoring, preparedness, and climate analysis to mitigate future hurricane risks. 🚀
        </p>
      </div>

      {/* Hurricane Damage Chart */}
      <h2>💰 Economic Damage Caused by Hurricanes 💰</h2>
      <div className="chart-container">
        <p className="chart-description">
          The bar chart illustrates the total economic damage caused by hurricanes across various categories.
          Higher-category hurricanes generally result in greater financial losses, with Category 5 storms
          causing the most damage. This trend highlights the destructive potential of intense hurricanes, emphasizing
          the need for disaster preparedness and mitigation efforts.
        </p>
        <img src={hudamage} alt="Hurricane Damage" className="chart-image" />
      </div>

      {/* Hurricane Deaths Chart */}
      <h2>⚠️ Fatalities Caused by Hurricanes ⚠️</h2>
      <div className="chart-container right-align">
        <img src={hudeath} alt="Hurricane Deaths" className="chart-image" />
        <p className="chart-description">
          The bar chart displays the total number of deaths caused by hurricanes across various categories.
          While higher-category hurricanes tend to cause more fatalities, some lower-category storms have
          also resulted in significant death tolls, likely due to flooding, infrastructure damage, and population density.
          This emphasizes the importance of early warnings and emergency response systems to minimize loss of life.
        </p>
      </div>
      <h2>🌍 Hurricane Prediction Map 🌍</h2>
      <p className="map-description">
        The heatmap visually represents the predicted hurricane occurrences across the entire United States, including both major and minor states.
        Darker red regions indicate higher hurricane activity, with coastal states like Florida, Texas, and Louisiana showing the highest risk.
        This visualization helps in identifying hurricane-prone areas, aiding in disaster preparedness and risk management.
      </p>
      <div className="map-container">
        <iframe
          src={`${import.meta.env.BASE_URL}hurricane_map.html`}
          title="Hurricane Prediction Map"
          className="hurricane-map"
        >
        </iframe>
      </div>
    </div>
  );
};

export default Hurricane;
