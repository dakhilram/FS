import React, { useState } from "react";
import "../styles/Alerts.css"; // Add a new style file for alerts

const Alerts = () => {
  const [zipCode, setZipCode] = useState("");
  const [locationData, setLocationData] = useState(null);
  const [error, setError] = useState(null);

  const handleZipCodeSearch = async () => {
    if (!zipCode) {
      setError("Please enter a valid Zip Code.");
      return;
    }

    try {
      // Fetch location data using a Zip Code API
      const response = await fetch(`https://api.zippopotam.us/us/${zipCode}`);
      const data = await response.json();

      if (data.places) {
        setLocationData({
          city: data.places[0]["place name"],
          state: data.places[0]["state"],
          latitude: data.places[0]["latitude"],
          longitude: data.places[0]["longitude"],
        });
        setError(null);
      } else {
        setError("Invalid Zip Code. Please try again.");
        setLocationData(null);
      }
    } catch (error) {
      setError("Failed to fetch location. Please check the Zip Code.");
      setLocationData(null);
    }
  };

  return (
    <div className="alerts-page">
      <h1>Emergency Alerts</h1>
      <p>Enter your Zip Code to find alerts for your region.</p>

      {/* ✅ Zip Code Input */}
      <div className="zip-search">
        <input
          type="text"
          placeholder="Enter Zip Code"
          value={zipCode}
          onChange={(e) => setZipCode(e.target.value)}
        />
        <button onClick={handleZipCodeSearch}>Search</button>
      </div>

      {/* ✅ Show Location Data */}
      {error && <p className="error">{error}</p>}
      {locationData && (
        <div className="location-info">
          <h3>Location Found:</h3>
          <p><strong>City:</strong> {locationData.city}</p>
          <p><strong>State:</strong> {locationData.state}</p>
          <p><strong>Latitude:</strong> {locationData.latitude}</p>
          <p><strong>Longitude:</strong> {locationData.longitude}</p>
        </div>
      )}
    </div>
  );
};

export default Alerts;
