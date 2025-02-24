import React, { useState } from "react";
import axios from "axios";
import "../styles/Alerts.css";
import { MapContainer, TileLayer } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import { FaCloudSun, FaWind, FaTint, FaTemperatureHigh, FaSun, FaMoon, FaGlobe } from "react-icons/fa";

const API_BASE_URL = window.location.hostname === "localhost"
  ? "http://localhost:5000"
  : "https://fs-51ng.onrender.com";

const API_KEY = "YOUR_OPENWEATHER_API_KEY"; // Replace with your API Key

const Alerts = () => {
  const [location, setLocation] = useState("Houston");
  const [weather, setWeather] = useState(null);
  const [error, setError] = useState("");
  const [coords, setCoords] = useState({ lat: 29.7604, lon: -95.3698 }); // Default to Houston

  // ✅ Fetch Weather Data
  const fetchWeather = async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}/weather`, {
        params: { city: location },
      });

      if (response.data.cod !== 200) {
        setError("Failed to fetch weather data.");
        return;
      }

      setWeather(response.data);
      setCoords({
        lat: response.data.coord.lat,
        lon: response.data.coord.lon,
      });
      setError("");
    } catch (err) {
      console.error("Error fetching weather:", err);
      setError("Failed to fetch weather alerts.");
    }
  };

  return (
    <div className="alerts-container">
      <h2 className="alerts-header">
        <FaGlobe /> Weather Alerts
      </h2>

      <div className="search-box">
        <input
          type="text"
          value={location}
          onChange={(e) => setLocation(e.target.value)}
          placeholder="Enter city or ZIP code"
        />
        <button className="get-alerts" onClick={fetchWeather}>
          Search
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

      {/* ✅ Weather Map */}
      <div className="weather-map">
        <h3>Live Weather Map</h3>
        <MapContainer center={[coords.lat, coords.lon]} zoom={10} style={{ height: "400px", width: "100%" }}>
          <TileLayer
            url={`https://tile.openweathermap.org/map/temp_new/{z}/{x}/{y}.png?appid=${API_KEY}`}
            attribution="© OpenWeather"
          />
        </MapContainer>
      </div>
    </div>
  );
};

export default Alerts;
