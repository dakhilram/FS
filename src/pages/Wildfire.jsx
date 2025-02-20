import React from "react";
import "../styles/WildFire.css";
import wildfireImage from "../assets/wf.jpg";
import wildhour from "../assets/wildfire/wildfiresbyhour.png";
import wildoccu from "../assets/wildfire/fireoccurrence.png";
import wildfireTrend from "../assets/wildfire/WildFiretrend.png"; // ✅ Import new image

const Wildfire = () => {
  return (
    <div className="nature-page">
      <h1>🌲🔥 WILDFIRES 🔥🌲</h1>
      {/* Main Image */}
      <img src={wildfireImage} alt="Wildfire" className="nature-image" />

      <p className="intro-text">
      Wildfires are uncontrolled fires that spread rapidly across forests, grasslands, and other vegetation. 
      These fires can be beneficial in some cases, clearing old vegetation and promoting new growth, but they also pose a serious threat to human 
      life, wildlife, and ecosystems. Wildfires ignite due to natural causes, such as lightning strikes, or human activities, 
      including unattended campfires, discarded cigarettes, and power line failures. In recent years, climate change has intensified wildfires, 
      making them more frequent and severe.
      </p>


      {/* Additional Information */}
      <h2>🔥 The Growing Impact of Wildfires 🔥</h2>
      <p className="intro-text">
        Over the past two decades, wildfires have increased in frequency and intensity across the world, 
        particularly in regions like California, Australia, and the Amazon Rainforest. 
        Factors like drought, heatwaves, and human land development have made ecosystems more vulnerable.
        Wildfires destroy homes, displace wildlife, and release massive amounts of carbon dioxide, 
        contributing to climate change. Improved fire management, stricter regulations on human activities, 
        and investment in early detection systems can help mitigate their effects.
      </p>



      {/* Wildfire Trend Over the Years */}
      <h2>📈 Wildfire Trends Over the Years</h2>
      <div className="chart-container">
        <img src={wildfireTrend} alt="Wildfire Trend" className="chart-image" />
        <p className="chart-description">
          Over the past two decades, wildfire activity has dramatically increased. Some years, like 2007 and 2023, 
          saw extreme wildfire occurrences with hectares burned exceeding 50,000. These trends highlight the growing impact 
          of climate change and human influence on wildfire frequency and intensity.
        </p>
      </div>

      {/* Wildfire Occurrence - Day vs Night */}
      <h2>🌙 Day vs. Night Wildfire Occurrence</h2>
      <div className="chart-container right-align">
        <p className="chart-description">
        Wildfires are far more common during the daytime than at night. 
        During the day, the sun’s heat dries out vegetation, making it easier for fires to ignite and spread. However, at night, 
        cooler temperatures and higher humidity slow fire activity, giving firefighters a better chance at containing the flames. 
        The total number of fires occurred in the day is 55,714, while the total number of fires occurred in the night is 18,891.
        </p>
        <img src={wildoccu} alt="Wildfire Occurrence" className="chart-image" />
      </div>
      
      {/* Wildfire Occurrence by Hour */}
      <h2>🔥 When do Wildfires Occur Most?</h2>
      <div className="chart-container">
        <img src={wildhour} alt="Wildfire by Hour" className="chart-image" />
        <p className="chart-description">
          Studies show that wildfires are most frequent between late morning and early afternoon, peaking around noon to 1 PM. 
          This pattern aligns with rising temperatures, lower humidity, and increased wind speeds, creating ideal conditions for fires to spread rapidly.
        </p>
      </div>

      

      
    </div>
  );
};

export default Wildfire;
