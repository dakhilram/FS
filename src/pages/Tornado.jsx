import React from "react";
import "../styles/Tornado.css";
import tornadoImage from "../assets/to.jpg";
import totrend from "../assets/Tornados/Trend.png";
import toinjuries from "../assets/Tornados/Injuries.png";
import tobubble from "../assets/Tornados/tobubble.jpg";
import { useEffect } from "react";
import { useLocation } from "react-router-dom";

const Tornado = () => {
  const location = useLocation();

useEffect(() => {
  if (location.hash === "#graphs") {
    setTimeout(() => {
      const el = document.getElementById("graphs");
      if (el) {
        const yOffset = -80; // Adjust based on your navbar height
        const y = el.getBoundingClientRect().top + window.pageYOffset + yOffset;
        window.scrollTo({ top: y, behavior: "smooth" });
      }
    }, 100); // Add slight delay to ensure DOM is ready
  }
}, [location]);
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

      <h2>🧠 How the Tornado Prediction Model Works</h2>
      <p className="intro-text">
        The Tornado Prediction Model is designed to estimate the possibility of a tornado forming based on real-time weather patterns for your ZIP code.
        It collects live data for:
        <ul>
          <li><strong>Wind Speed</strong> – High-speed winds are a critical indicator.</li>
          <li><strong>Temperature</strong> – Sudden changes can cause instability in the air.</li>
          <li><strong>Atmospheric Pressure</strong> – Rapid pressure drops often precede tornadoes.</li>
        </ul>
        This data is processed using a pre-trained <strong>Logistic Regression</strong> model that has learned from past tornado events. The model outputs:
        <ul>
          <li><strong>0</strong> – Safe (no tornado expected)</li>
          <li><strong>1</strong> – Risk of Tornado</li>
        </ul>
        If risk is detected, users are instantly notified and encouraged to follow safety protocols. Our system helps increase awareness and preparedness for such sudden disasters.
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
      <h2 id="graphs">🌍 Tornado Trends Over Time</h2>
      <div className="chart-container">
        <img src={totrend} alt="Tornado Trend" className="chart-image" />
        <p className="chart-description">This graph depicts the number of tornadoes occurring annually over time.
          In the Early Years (1950s) the number of recorded tornadoes starts at around 200 and rises steadily.
          During the 1960s–1980s, the number of tornadoes fluctuates significantly, with multiple peaks and drops. The highest peak appeared around 1974 and another significant peak around 2011, both exceeding 800 tornadoes in a year.
          Climate patterns, such as El Niño/La Niña cycles, may contribute to periodic increases or decreases in tornado activity.
          The sharp spike around 2011 aligns with a well-known period of increased tornado activity in the U.S., particularly the 2011 Super Outbreak.
        </p>
      </div>

      <h2>🚑 Tornado Injuries Per Year</h2>
      <div className="chart-container right-align">
        <p className="chart-description">The bar chart illustrates the number of injuries caused by tornadoes over the years.
          Certain years stand out with extremely high injury counts, notably around 1953, 1974, 2011, where injuries exceeded 5000–7000 in a single year.
          The spike in 1974 corresponds to the Super Outbreak of 1974, one of the deadliest tornado outbreaks in U.S. history.
          The peak around 2011 aligns with the 2011 Super Outbreak, which caused over 5,000 injuries.
        </p>
        <img src={toinjuries} alt="Tornado Injuries" className="chart-image" />
      </div>

      <h2> Tornado Occurrence by States</h2>
      <div className="chart-container">
        <img src={tobubble} alt="Tornado Trend" className="chart-imagebubble" />
        <p className="chart-description">The image represents a bubble map of tornado occurrences across the United States.
          The size of each bubble corresponds to the number of tornadoes reported in that state, with larger bubbles indicating a higher occurrence.
          The color intensity also varies, with darker shades of red representing states with more tornadoes.
          Texas has the highest number of tornadoes, as indicated by the largest and darkest bubble.
          Other states in the Midwest and Southeastern regions, such as Oklahoma, Kansas, and Florida, also show significant tornado activity.
          States in the Western and Northeastern U.S. have relatively smaller bubbles, indicating fewer tornado occurrences.
        </p>
      </div>

      <h2>🌍 Tornado Prediction Map 🌍</h2>
      <p className="map-description">
        The Tornado Heatmap is an interactive visualization that highlights the geographical distribution and intensity of tornado occurrences across the United States.
        The map utilizes heatmap layers to represent high-risk tornado zones based on historical data.
        The heatmap visually represents tornado occurrences, with brighter and denser areas indicating higher tornado frequency.
        The heatmap spans across major tornado-prone states in the U.S., particularly in the Tornado Alley region, including Texas, Oklahoma, Kansas, Nebraska, and surrounding states.
      </p>
      <div className="map-container">
        <iframe
          src={`${import.meta.env.BASE_URL}tornado_heatmap.html`}
          title="Hurricane Prediction Map"
          className="hurricane-map"
        >
        </iframe>
      </div>

    </div>
  );
};

export default Tornado;
