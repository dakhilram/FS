import React from "react";
import "../styles/Terrorism.css";
import terrorismImage from "../assets/te.jpg";
import attackTypeChart from "../assets/Terrorism/attack_type.png";
import fatalitiesChart from "../assets/Terrorism/fatalities_over_years.png";
import terrortrend from "../assets/Terrorism/te_trend.png";

const Terrorism = () => {
  return (
    <div className="nature-page">
      <h1>🛡️ Terrorism in the United States 🛡️</h1>
      
      {/* Main Terrorism Image */}
      <img src={terrorismImage} alt="Terrorism" className="nature-image" />

      {/* Introduction */}
      <h2>⚠️ Understanding Terrorism ⚠️</h2>
      <p className="intro-text">
        Terrorism poses a significant threat to national security and public safety. 
        Understanding the patterns of terrorist activities is crucial for law enforcement, policymakers, and the general public. 
        This section provides insights into different attack types, fatalities over time, and geographic distribution of terrorism incidents.
        Bombing/Explosion is the most frequent attack type, indicating its prevalence in terrorist activities. 
        Facility/Infrastructure Attacks also occur frequently, targeting public and private structures. 
        Assassinations and Unarmed Assaults occur less frequently but still pose security threats. 
        Hostage Taking (Kidnapping and Barricade Incidents), Hijacking, and Unknown attack types are comparatively rare. 
        Understanding these attack patterns can help law enforcement, policymakers, and security agencies focus on preventive 
        measures and resource allocation.
      </p>

      {/* Attack Type Distribution Chart */}
      <h2>📊 Attack Type Distribution 📊</h2>
      <div className="chart-container">
        <img src={attackTypeChart} alt="Attack Type Distribution" className="chart-image" />
        <p className="chart-description">
          The Attack Type Distribution Chart provides a visual representation of the different types of terrorist attacks 
          that have occurred across the United States. The most frequent attack type is Bombing/Explosion, 
          followed by Facility/Infrastructure Attacks. Other attacks such as Assassinations and Unarmed Assaults 
          occur less frequently but still pose a threat.
        </p>
      </div>

      {/* Fatalities Over the Years */}
      <h2>📈 Fatalities in Terrorist Attacks (1970-2020) 📉</h2>
      <div className="chart-container right-align">
        <p className="chart-description">
          The Fatalities in Terrorist Attacks Over the Years chart provides a historical perspective 
          on the number of deaths resulting from terrorism incidents in the United States. 
          A significant spike occurred in 2001, corresponding to the September 11 attacks, 
          the deadliest terrorism event in U.S. history.
        </p>
        <img src={fatalitiesChart} alt="Fatalities Over the Years" className="chart-image" />
      </div>

      {/* Attack Type Distribution Chart */}
      <h2>📊 Attack Type Distribution 📊</h2>
      <div className="chart-container">
        <img src={terrortrend} alt="Attack Type Distribution" className="chart-image" />
        <p className="chart-description">
        This graph visualizes the number of terrorist attacks per year in the United States over time.
         The number of attacks was extremely high in 1970, peaking above 450 attacks. 
         This rapidly declined over the next few years. Between 1975-1985, 
         terrorist activity saw periodic spikes, with some years exceeding 100 attacks. 
         This could be due to various domestic and international events. 
         From 1990 to 2010, the number of terrorist incidents remained relatively low and stable, 
         mostly below 50 attacks per year. There were some minor peaks but no major surges.  
         After 2010, there is a gradual rise in the number of attacks. By 2020, the number of attacks reached approximately 100 again.
        </p>
      </div>


      {/* Interactive Map */}
      <h2>🌍 USA Terrorism Incident Map 📍</h2>
      <p className="intro-text">
        This interactive scatter map visualizes historical terrorism incidents in the U.S. 
        Users can explore terrorism-related activity across different regions using zoom and clustering techniques 
        for better clarity.
      </p>
      <div className="map-container">
        <iframe
          src=  {`${import.meta.env.BASE_URL}terrorism_map.html`} 
          title="Terrorism Scatter Map"
          className="terrorism-map"
        ></iframe>
      </div>


    </div>
  );
};

export default Terrorism;
