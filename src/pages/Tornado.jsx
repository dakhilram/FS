import React from "react";
import "../styles/Tornado.css";
import tornadoImage from "../assets/to.jpg";
import totrend from "../assets/Tornados/Trend.png";
import toinjuries from "../assets/Tornados/Injuries.png";

const Tornado = () => {
  return (
    <div className="nature-page">
      <h1>🌪️ Tornado Information</h1>

      <img src={tornadoImage} alt="Tornado" className="nature-image" />

      <p className="intro-text">
        Tornadoes are violently rotating columns of air that extend from a 
        thunderstorm to the ground. They are among the most powerful natural 
        disasters, capable of destroying buildings, uprooting trees, and hurling 
        debris over long distances. 
        Tornadoes typically form when warm, moist air collides with cool, dry air, 
        creating instability in the atmosphere. This often occurs in regions such as 
        the United States' "Tornado Alley," where conditions are ideal for frequent 
        tornado outbreaks.
      </p>

      <h2>⚠️ Safety Measures During a Tornado </h2>
      <p className="intro-text">
        If a tornado warning is issued, seek shelter in a basement, storm cellar, or an 
        interior room on the lowest floor of a sturdy building. Avoid windows and cover 
        yourself with thick padding, such as mattresses, to reduce injury risk.
        After a tornado, be cautious of fallen power lines, gas leaks, and structural 
        damage. Emergency responders advise waiting for official safety confirmations 
        before leaving a shelter.
      </p>
      <h2>🌍 Tornado Trends Over Time</h2>
      <div className="chart-container">
        <img src={totrend} alt="Tornado Trend" className="chart-image" />
        <p className="chart-description">
          Tornado occurrences have increased over the years due to improved detection 
          technologies and changing climate patterns. The highest peaks indicate years 
          with extreme tornado activity, often influenced by El Niño and La Niña cycles.
        </p>
      </div>

      <h2>🚑 Tornado Injuries Per Year</h2>
      <div className="chart-container right-align">
        <p className="chart-description">
          Tornadoes can cause thousands of injuries annually, with major spikes occurring 
          in years with severe outbreaks. Strong tornadoes, categorized as EF4 and EF5, 
          are responsible for the most destruction, leading to fatalities and infrastructure loss.
        </p>
        <img src={toinjuries} alt="Tornado Injuries" className="chart-image" />
      </div>

      
    </div>
  );
};

export default Tornado;
