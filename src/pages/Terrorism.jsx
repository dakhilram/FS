import React from "react";
import "../styles/Terrorism.css";
import terrorismImage from "../assets/Te.jpg"; // Ensure the correct path

const Terrorism = () => {
  return (
    <div className="info-page">
      <h1>Terrorism Alerts & Information</h1>
      <img src={terrorismImage} alt="Terrorism Alert" className="info-image" />
      <p>
        Terrorism threats require constant monitoring and awareness.
        Stay informed about security measures and emergency responses.
      </p>
    </div>
  );
};

export default Terrorism;
