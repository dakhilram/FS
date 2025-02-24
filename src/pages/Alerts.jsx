import React, { useState } from "react";
import axios from "axios";
import "../styles/Alerts.css";

const API_BASE_URL = window.location.hostname === "localhost"
  ? "http://localhost:5000"
  : "https://fs-51ng.onrender.com";

const Alerts = () => {
  const [city, setCity] = useState("Houston");
  const [weatherData, setWeatherData] = useState(null);
  const [error, setError] = useState("");

  const fetchWeatherAlerts = async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}/weather-alerts`, {
        params: { city }
      });
      setWeatherData(response.data);
      setError("");
    } catch (err) {
      setError("Failed to fetch weather alerts.");
      setWeatherData(null);
    }
  };

  return (
    <div className="alerts-page">
      <h1>🌍 Weather Alerts</h1>
      <div className="zip-search">
        <input
          type="text"
          placeholder="Enter City"
          value={city}
          onChange={(e) => setCity(e.target.value)}
        />
        <button onClick={fetchWeatherAlerts}>Get Alerts</button>
      </div>

      {error && <p className="error">{error}</p>}

      {weatherData && (
        <div className="location-info">
          <h2>{weatherData.city}</h2>
          <p>🌡 Temperature: {weatherData.temperature}°C</p>
          <p>💧 Humidity: {weatherData.humidity}%</p>
          <p>🌬 Wind Speed: {weatherData.wind_speed} m/s</p>
          <p>☁ Condition: {weatherData.weather}</p>
          <img src={`http://openweathermap.org/img/wn/${weatherData.icon}@2x.png`} alt="Weather icon"/>
        </div>
      )}
    </div>
  );
};

export default Alerts;
