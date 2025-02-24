import React, { useState } from "react";
import axios from "axios";
import "../styles/Alerts.css";
import { FaCloudSun, FaWind, FaTint, FaTemperatureHigh, FaSun, FaMoon } from "react-icons/fa";

const API_BASE_URL = "http://localhost:5000"; // Adjust based on deployment

const Alerts = () => {
  const [city, setCity] = useState("Houston");
  const [weather, setWeather] = useState(null);
  const [error, setError] = useState("");

  // ✅ Fetch Weather Data
  const fetchWeather = async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}/weather`, {
        params: { city },
      });

      if (response.data.cod !== 200) {
        setError("Failed to fetch weather data.");
        return;
      }

      setWeather(response.data);
      setError("");
    } catch (err) {
      console.error("Error fetching weather:", err);
      setError("Failed to fetch weather alerts.");
    }
  };

  return (
    <div className="alerts-container">
      <h2 className="alerts-header">
        <FaCloudSun /> Weather Alerts
      </h2>

      <div className="search-box">
        <input
          type="text"
          value={city}
          onChange={(e) => setCity(e.target.value)}
          placeholder="Enter city name"
        />
        <button className="get-alerts" onClick={fetchWeather}>
          Get Alerts
        </button>
      </div>

      {error && <p className="error-text">{error}</p>}

      {weather && (
        <div className="weather-card">
          <h3>{weather.name}</h3>
          <div className="weather-details">
            <p><FaTemperatureHigh /> Temperature: {weather.main.temp.toFixed(2)}°C</p>
            <p><FaTint /> Humidity: {weather.main.humidity}%</p>
            <p><FaWind /> Wind Speed: {weather.wind.speed} m/s</p>
            <p><FaCloudSun /> Condition: {weather.weather[0].description}</p>
            <p><FaSun /> Sunrise: {new Date(weather.sys.sunrise * 1000).toLocaleTimeString()}</p>
            <p><FaMoon /> Sunset: {new Date(weather.sys.sunset * 1000).toLocaleTimeString()}</p>
          </div>
        </div>
      )}
    </div>
  );
};

export default Alerts;
