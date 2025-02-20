import React from "react";
import "../styles/WildFire.css";
import wildfireImage from "../assets/wf.jpg";
import wildhour from "../assets/wildfire/wildfiresbyhour.png";
import wildoccu from "../assets/wildfire/fireoccurrence.png";

const Wildfire = () => {
  return (
    <div className="nature-page">
      <h1>🔥 WILDFIRES 🔥</h1>
      {/* Main Wildfire Image */}
      <img src={wildfireImage} alt="Wildfire" className="nature-image" />
      <p className="intro-text">
        Wildfires are uncontrolled fires that spread rapidly across forests, grasslands, and other vegetation.
        These fires can be beneficial in some cases, clearing old vegetation and promoting new growth, 
        but they also pose a serious threat to human life, wildlife, and ecosystems.
        Wildfires ignite due to natural causes, such as lightning strikes, or human activities, 
        including unattended campfires, discarded cigarettes, and power line failures.
        In recent years, climate change has intensified wildfires, making them more frequent and severe.
      </p>

      

      {/* Wildfire by Hour Chart - Left Image, Right Text */}
      <h2>🔥 When Do Wildfires Occur Most? 🔥</h2>
      <div className="chart-container">
        <img src={wildhour} alt="Wildfires by Hour" className="chart-image" />
        <p className="chart-description">
          Studies show that wildfires are most frequent between late morning and early afternoon, 
          with activity peaking around noon to 1 PM. 
          This pattern aligns with rising temperatures, lower humidity, and increased wind speeds, 
          which create the ideal conditions for fires to spread rapidly. 
        </p>
      </div>

      {/* Wildfire Occurrence Chart - Right Side */}
      <h2>🌞 Day vs. Night Wildfire Occurrence 🌙</h2>
      <div className="chart-container right-align">
        <p className="chart-description">
          Wildfires are far more common during the daytime than at night. 
          During the day, the sun’s heat dries out vegetation, making it easier for fires to ignite and spread. 
          However, at night, cooler temperatures and higher humidity slow fire activity, 
          giving firefighters a better chance at containing the flames. The total number of fires occurred in the day is 55,714, while the total number of fires occurred in the night is 18,891.
        </p>
        <img src={wildoccu} alt="Wildfire Occurrence" className="chart-image" />
      </div>

      {/* Additional Information */}
      <h2>🔥 The Growing Impact of Wildfires 🔥</h2>
      <p className="intro-text">
        Over the past two decades, wildfires have increased in frequency and intensity across the world, 
        particularly in regions like California, Australia, and the Amazon Rainforest. 
        Factors like **drought, heatwaves, and human land development have made ecosystems more vulnerable.
        Wildfires destroy homes, displace wildlife, and release massive amounts of carbon dioxide, 
        contributing to climate change. Improved fire management, stricter regulations on human activities, 
        and investment in early detection systems can help mitigate their effects.
      </p>
    </div>
  );
};

export default Wildfire;
