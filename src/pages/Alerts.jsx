import React, { useState, useEffect } from "react";
import axios from "axios";
import "../styles/Alerts.css";
import { MapContainer, TileLayer, Marker, Popup, useMap } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import L from "leaflet";
import {
  FaCloudSun,
  FaWind,
  FaTint,
  FaTemperatureHigh,
  FaSun,
  FaMoon,
  FaSyncAlt,
  FaBell,
} from "react-icons/fa";

const API_BASE_URL = window.location.hostname === "localhost"
  ? "http://localhost:5000"
  : "https://fs-51ng.onrender.com";

const weatherIcons = {
  Clear: "https://cdn-icons-png.flaticon.com/512/869/869869.png",
  Rain: "https://cdn-icons-png.flaticon.com/512/3075/3075858.png",
  Thunderstorm: "https://cdn-icons-png.flaticon.com/512/1146/1146860.png",
  Snow: "https://cdn-icons-png.flaticon.com/512/642/642102.png",
  Clouds: "https://cdn-icons-png.flaticon.com/512/414/414825.png",
  Default: "https://cdn-icons-png.flaticon.com/512/1163/1163661.png"
};

const RecenterMap = ({ coords }) => {
  const map = useMap();
  useEffect(() => {
    if (coords) {
      map.setView([coords.lat, coords.lon], 10);
    }
  }, [coords]);
  return null;
};

const Alerts = () => {
  const [location, setLocation] = useState("");
  const [weatherData, setWeatherData] = useState(null);
  const [error, setError] = useState("");
  const [coords, setCoords] = useState({ lat: 29.7604, lon: -95.3698 });
  const [unit, setUnit] = useState("metric");
  const [autoDetected, setAutoDetected] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [emailStatus, setEmailStatus] = useState("");

  const [userEmail, setUserEmail] = useState(localStorage.getItem("user_email"));

  // Listen for localStorage updates
  useEffect(() => {
    const handleStorageChange = () => {
      setUserEmail(localStorage.getItem("user_email"));
    };

    window.addEventListener("storage", handleStorageChange);
    return () => window.removeEventListener("storage", handleStorageChange);
  }, []);


  const fetchWeather = async (lat = null, lon = null) => {
    try {
      let params;

      if (lat && lon) {
        params = { lat, lon, units: unit };
      } else {
        if (!location.trim()) {
          setError("Please enter a valid city name or ZIP code.");
          return;
        }
        params = isNaN(location)
          ? { q: location, units: unit }
          : { zip: location, units: unit };
        setAutoDetected(false);
      }

      const response = await axios.get(`${API_BASE_URL}/weather`, { params });

      if (response.data.error) {
        setError(response.data.error);
        return;
      }

      setWeatherData(response.data);
      setCoords({
        lat: response.data.location.lat,
        lon: response.data.location.lon,
      });
      setError("");
    } catch (err) {
      console.error("Error fetching weather:", err);
      setError("Failed to fetch weather data. Please try again.");
    }
  };

  useEffect(() => {
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const { latitude, longitude } = pos.coords;
        fetchWeather(latitude, longitude);
        setAutoDetected(true);
      },
      (err) => {
        console.warn("Geolocation denied or failed:", err.message);
      }
    );
  }, []);

  useEffect(() => {
    if (weatherData) {
      if (autoDetected) {
        fetchWeather(weatherData.location.lat, weatherData.location.lon);
      } else {
        fetchWeather();
      }
    }
  }, [unit]);

  const handleGenerateAlert = async () => {
    if (!weatherData || !userEmail) return;

    const { lat, lon } = weatherData.location;

    try {
      const response = await axios.post(`${API_BASE_URL}/generate-alert-email`, {
        lat,
        lon,
        email: userEmail,
      });

      if (response.data.alertAvailable === false) {
        setShowConfirm(true);
      } else {
        setEmailStatus("✅ Alert email sent!");
      }
    } catch (err) {
      console.error("Error sending alert email:", err);
      setEmailStatus("❌ Failed to send email.");
    }
  };

  const sendAnyway = async () => {
    setShowConfirm(false);
    const { lat, lon } = weatherData.location;

    try {
      await axios.post(`${API_BASE_URL}/generate-alert-email`, {
        lat,
        lon,
        email: userEmail,
        forceSend: true,
      });
      setEmailStatus("✅ Email sent without active alert.");
    } catch (err) {
      setEmailStatus("❌ Failed to send email.");
    }
  };

  const weatherClass = weatherData?.current?.weather[0]?.main?.toLowerCase() || "";
  const iconUrl = weatherIcons[weatherData?.current?.weather[0]?.main] || weatherIcons.Default;
  const tempSymbol = unit === "metric" ? "°C" : "°F";
  const windUnit = unit === "metric" ? "m/s" : "mph";

  return (
    <div className={`alerts-container ${weatherClass}`}>
      <h2 className="alerts-header">🌍 Weather Alerts & Forecasts</h2>

      <div className="search-wrapper">
        <div className="search-box">
          <input
            type="text"
            value={location}
            onChange={(e) => setLocation(e.target.value)}
            placeholder="Enter city name or ZIP code"
          />
          <button className="get-alerts" onClick={() => fetchWeather()}>Search</button>
          <button className="refresh-btn" onClick={() => {
            if (autoDetected && weatherData?.location) {
              fetchWeather(weatherData.location.lat, weatherData.location.lon);
            } else {
              fetchWeather();
            }
          }}>
            <FaSyncAlt /> Refresh
          </button>
        </div>

        <div className="unit-toggle">
          <button onClick={() => setUnit("metric")} disabled={unit === "metric"}>°C</button>
          <button onClick={() => setUnit("imperial")} disabled={unit === "imperial"}>°F</button>
        </div>
      </div>

      {userEmail && weatherData && (
        <button className="generate-alert-btn" onClick={handleGenerateAlert}>
          📧 Generate Alert
        </button>
      )}

      {showConfirm && (
        <div className="confirm-box">
          <p>No alerts found for this location. Do you still want to send an email?</p>
          <button onClick={sendAnyway}>Yes, send anyway</button>
          <button onClick={() => setShowConfirm(false)}>Cancel</button>
        </div>
      )}

      {emailStatus && <p className="info-text">{emailStatus}</p>}
      {autoDetected && <p className="info-text">📍 Showing weather for your current location.</p>}
      {error && <p className="error-text">{error}</p>}

      {weatherData && (
        <>
          <div className="weather-card">
            <h3>📍 {weatherData.location.name}</h3>
            <div className="weather-details">
              <img src={iconUrl} alt="weather icon" style={{ width: 60 }} />
              <p><FaTemperatureHigh /> Temp: {weatherData.current.temp}{tempSymbol}</p>
              <p><FaTint /> Humidity: {weatherData.current.humidity}%</p>
              <p><FaWind /> Wind: {weatherData.current.wind_speed} {windUnit}</p>
              <p><FaCloudSun /> Condition: {weatherData.current.weather[0].description}</p>
              <p><FaSun /> Sunrise: {new Date(weatherData.current.sunrise * 1000).toLocaleTimeString()}</p>
              <p><FaMoon /> Sunset: {new Date(weatherData.current.sunset * 1000).toLocaleTimeString()}</p>
            </div>
          </div>

          <div className="alerts-section">
            <h3><FaBell /> Weather Alerts</h3>
            {weatherData.alerts && weatherData.alerts.length > 0 ? (
              weatherData.alerts.map((alert, i) => (
                <div key={i} className="alert-box">
                  <h4>⚠️ {alert.event}</h4>
                  <p><strong>From:</strong> {new Date(alert.start * 1000).toLocaleString()}</p>
                  <p><strong>To:</strong> {new Date(alert.end * 1000).toLocaleString()}</p>
                  <p><strong>By:</strong> {alert.sender_name}</p>
                  <p>{alert.description}</p>
                </div>
              ))
            ) : (
              <p>No active alerts for this location ✅</p>
            )}
          </div>

          <div className="forecast-section">
            <h3>🕐 Today's Hourly Forecast</h3>
            <div className="forecast-scroll">
              {weatherData.hourly.slice(0, 12).map((hour, i) => (
                <div key={i} className="forecast-card">
                  <p>{new Date(hour.dt * 1000).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}</p>
                  <p>{hour.temp}{tempSymbol}</p>
                  <p>{hour.weather[0].main}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="forecast-section">
            <h3>📅 8-Day Forecast</h3>
            <div className="forecast-scroll">
              {weatherData.daily.map((day, i) => (
                <div key={i} className="forecast-card">
                  <p>{new Date(day.dt * 1000).toLocaleDateString([], { weekday: "short", month: "short", day: "numeric" })}</p>
                  <p>{day.temp.max}{tempSymbol} / {day.temp.min}{tempSymbol}</p>
                  <p>{day.weather[0].main}</p>
                </div>
              ))}
            </div>
          </div>

          <h3 className="map-header">📍 Location Map</h3>
          <MapContainer center={[coords.lat, coords.lon]} zoom={10} className="weather-map">
            <RecenterMap coords={coords} />
            <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
            <Marker
              position={[coords.lat, coords.lon]}
              icon={L.icon({ iconUrl, iconSize: [40, 40] })}
            >
              <Popup>
                {weatherData.location.name} <br /> {weatherData.current.weather[0].description}
              </Popup>
            </Marker>
          </MapContainer>
        </>
      )}
    </div>
  );
};

export default Alerts;
