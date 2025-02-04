import React from "react";
import "../styles/Nature.css";
import wildfireImage from "../assets/wf.jpg";

const Wildfire = () => {
  return (
    <div className="nature-page">
      <h1>Wildfire Information</h1>
      <img src={wildfireImage} alt="Wildfire" className="nature-image" />
      <p>Wildfires spread rapidly in dry, windy conditions...</p>
    </div>
  );
};

export default Wildfire;
