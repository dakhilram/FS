import React from "react";
import "../styles/Nature.css";
import hurricaneImage from "../assets/Hu.jpg";

const Hurricane = () => {
  return (
    <div className="nature-page">
      <h1>Hurricane Information</h1>
      <img src={hurricaneImage} alt="Hurricane" className="nature-image" />
      <p>Hurricanes form over warm ocean waters and cause severe damage...</p>
    </div>
  );
};

export default Hurricane;
