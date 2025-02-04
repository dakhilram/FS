import React from "react";
import "../styles/Nature.css";
import earthquakeImage from "../assets/eq.jpg"; // Ensure the image path is correct

const Earthquake = () => {
  return (
    <div className="nature-page">
      <h1>Earthquake Information</h1>
      <img src={earthquakeImage} alt="Earthquake" className="nature-image" />
      <p>Earthquakes occur due to the movement of tectonic plates...</p>
    </div>
  );
};

export default Earthquake;
