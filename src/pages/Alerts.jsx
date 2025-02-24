import React, { useState, useEffect } from "react";
import axios from "axios";
import "../styles/Alerts.css";
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import { FaCloudSun, FaWind, FaTint, FaTemperatureHigh, FaSun, FaMoon } from "react-icons/fa";

const API_BASE_URL = window.location.hostname === "localhost"
  ? "http://localhost:5000"
  : "https://fs-51ng.onrender.com";

const Alerts = () => {
  const [location, setLocation] = useState("Houston");
  const [weather, setWeather] = useState(null);
  const [error, setError] = useState("");
  const [coords, setCoords] = useState({ lat: 29.7604, lon: -95.3698 }); // Default to Houston

  // ✅ Fetch Weather Data
  const fetchWeather = async () => {
    try {
      let params;
      if (!isNaN(location)) {
        params = { zip: `${location},US` };
      } else {
        params = { q: location };
      }
  
      console.log("Fetching weather for:", params); // ✅ Debugging Log
  
      const response = await axios.get(`${API_BASE_URL}/weather`, { params });
  
      console.log("API Response:", response.data); // ✅ Log Response
  
      if (response.data.cod !== 200) {
        setError(`API Error: ${response.data.message}`);
        return;
      }
  
      setWeather(response.data);
      setCoords({ lat: response.data.coord.lat, lon: response.data.coord.lon });
      setError("");
    } catch (err) {
      console.error("Error fetching weather:", err);
      setError("Failed to fetch weather alerts. Check the console.");
    }
  };
  

  return (
    <div className="alerts-container">
      <h2 className="alerts-header">
        🌍 Weather Alerts
      </h2>

      <div className="search-box">
        <input
          type="text"
          value={location}
          onChange={(e) => setLocation(e.target.value)}
          placeholder="Enter city name or ZIP"
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

      {/* ✅ Live Weather Map */}
      <h3 className="map-header">Live Weather Map</h3>
      <MapContainer center={[coords.lat, coords.lon]} zoom={10} className="weather-map">
        <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
        {weather && (
          <Marker position={[coords.lat, coords.lon]}>
            <Popup>
              {weather.name} <br /> {weather.weather[0].description}
            </Popup>
          </Marker>
        )}
      </MapContainer>
    </div>
  );
};

export default Alerts;
