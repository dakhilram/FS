import React from "react";
import "../styles/Nature.css";
import tornadoImage from "../assets/to.jpg";

const Tornado = () => {
  return (
    <div className="nature-page">
      <h1>Tornado Information</h1>
      <img src={tornadoImage} alt="Tornado" className="nature-image" />
      <p>Tornadoes are violently rotating columns of air that reach the ground...</p>
    </div>
  );
};

export default Tornado;
