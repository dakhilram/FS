import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import "../styles/Hero.css";
import videoBg from "../assets/4.mp4"; // Background video
import earthquakeTrend from "../assets/Earthquake/eqtrend.png";
import wildfireTrend from "../assets/wildfire/WildFiretrend.png";
import tornadoTrend from "../assets/Tornados/trend.png";
import hurricaneTrend from "../assets/hurricane/hutrend.png";
import LoadingScreen from "../pages/LoadingScreen.jsx"; // ✅ Ensure correct path

const Hero = () => {
  const navigate = useNavigate();
  const [currentSlide, setCurrentSlide] = useState(0);
  const serviceRef = useRef(null);
  const [selectedModel, setSelectedModel] = useState(null);
  const [file, setFile] = useState(null);
  const [downloadLinks, setDownloadLinks] = useState(null);
  const [loading, setLoading] = useState(false);
  const username = localStorage.getItem("username");
  const fileInputRef = useRef(null);


  // Disaster Trends Data
  const slides = [
    { img: earthquakeTrend, title: "📊 Earthquake Magnitude Trends", desc: "Observe the historical shifts in earthquake magnitudes.", link: "/nature/earthquake" },
    { img: wildfireTrend, title: "🔥 Wildfire Occurrences Over Time", desc: "Track how climate change influences wildfire intensity.", link: "/nature/wildfire" },
    { img: tornadoTrend, title: "🌪️ Tornado Frequency Per Year", desc: "Analyze tornado patterns across different regions.", link: "/nature/tornado" },
    { img: hurricaneTrend, title: "🌀 Hurricane Intensity Analysis", desc: "Understand hurricane strength variations over decades.", link: "/nature/hurricane" },
  ];

  // Auto-slide every 5 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % slides.length);
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  // Scroll to Service Overview when "Learn More" is clicked
  const handleLearnMore = () => {
    setTimeout(() => {
      serviceRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
    }, 200);
  };

  // Scroll to Service Details when a service is selected
  const handleServiceClick = (model) => {
    setSelectedModel(model);
    setFile(null); // clears current file from state
    setDownloadLinks(null); // clears previous download links
    if (fileInputRef.current) {
      fileInputRef.current.value = null; // clears file input visually
    }
    setTimeout(() => {
      serviceRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
    }, 200);
  };
  

  // Handle File Upload
  const handleFileUpload = (event) => {
    setFile(event.target.files[0]);
  };

  // Function to Send File to Flask API
  const sendFileToBackend = async (endpoint) => {
    if (!file) {
      alert("Please upload a file first!");
      return;
    }

    setLoading(true); // ✅ Show loading screen

    const formData = new FormData();
    formData.append("file", file);

    try {
      const response = await fetch(`https://fs-51ng.onrender.com/${endpoint}`, {
        method: "POST",
        body: formData,
      });

      if (response.ok) {
        const data = await response.json();
        setDownloadLinks(data);
      } else {
        alert("Error processing the file. Please try again.");
      }
    } catch (error) {
      alert("Network error. Check your connection.");
    }

    setLoading(false); // ✅ Hide loading screen when done
  };

  // Handle Predictions for Different Models
  const handleGenerateReport = () => {
    if (loading) return; // ✅ Prevent multiple clicks while processing

    const modelEndpoints = {
      Wildfire: "predict-wildfire",
      Earthquake: "predict-earthquake",
      Tornado: "predict-tornado",
      Hurricane: "predict-hurricane",
    };

    if (selectedModel in modelEndpoints) {
      sendFileToBackend(modelEndpoints[selectedModel]);
    } else {
      alert("Invalid model selection!");
    }
  };

  const [showModal, setShowModal] = useState(false);

  const modelDescriptions = {
    Wildfire: `
  🔥 The Wildfire Prediction Model is initially trained on historical wildfire and satellite data (VIIRS). 
  - When the user uploads new data, the model incorporates it through dynamic training to ensure more accurate and personalized predictions. 
  - It applies advanced feature engineering, balances classes using SMOTE, and uses XGBoost for classification. 
  - The model predicts wildfire risk levels (Low to Extreme) for the next 30 days and visualizes high-risk zones. 
  - It outputs a comprehensive PDF report, a CSV file of predictions, and an HTML wildfire risk map.
  
  📁 Output files:
  - future_wildfire_predictions.csv
  - wildfire_future_predictions_report.pdf
    `,
  
    Earthquake: `
  🌍 The Earthquake Prediction Model is trained on historical seismic data including magnitude, depth, and location. 
  - User-uploaded data is integrated dynamically to update the clustering and risk classification results. 
  - The model uses unsupervised learning (KMeans, DBSCAN) to identify high-risk zones based on earthquake patterns. 
  - It generates visual heatmaps, historical activity trends, and risk zone clusters for interpretation. 
  - A PDF report summarizes seismic activity, predicts potential threats, and provides safety recommendations.
  
  📁 Output files:
  - earthquake_predictions.csv
  - earthquake_report.pdf
    `,
  
    Tornado: `
  🌪️ The Tornado Prediction Model learns from historical tornado events and real-time user data inputs. 
  - After being pre-trained on past storms, it dynamically fine-tunes itself using uploaded data for localized predictions. 
  - It uses XGBoost classification and ensemble methods, alongside feature extraction from wind, pressure, and humidity. 
  - The model forecasts tornado intensity levels and trends for upcoming days with visual summaries. 
  - Reports and maps provide insights into regional risk and preparedness recommendations.
  
  📁 Output files:
  - tornado_predictions.csv
  - tornado_report.pdf
    `,
  
    Hurricane: `
  🌊 The Hurricane Prediction Model is pre-trained using global historical data such as hurricane tracks, wind speeds, and pressure. 
  - User-provided data is used to fine-tune predictions in real-time, improving localized forecasting. 
  - Gradient boosting techniques are applied on features like wind speed, pressure, and humidity for accurate classification. 
  - It provides storm path projections, intensity levels, and historical comparisons through visual maps and charts. 
  - Users receive a PDF report with predicted hurricane paths, safety advice, and forecast maps.
  
  📁 Output files:
  - hurricane_predictions.csv
  - hurricane_report.pdf
    `,
  };
  

  return (
    <div className="page-container">
      {/* ✅ Show Loading Screen When Flask is Processing */}
      {loading && <LoadingScreen />}

      {/* Background Video */}
      <video autoPlay loop muted className="hero-video">
        <source src={videoBg} type="video/mp4" />
      </video>
      <div className="overlay"></div>

      {/* Hero Section */}
      <div className="hero-container">
        <h1 className="hero-heading">ForeSight</h1>
        <p className="hero-tagline">Predicting disasters ahead.</p>
        <div className="hero-content">
          <h1 className="hero-title">Empowering Disaster Predictions with AI</h1>
          <p className="hero-description">
            Gain insights into natural disasters using machine learning models.
            Upload datasets, analyze trends, and generate reports.
          </p>
          <div className="hero-buttons">
            {username ? (
              <>
                <p className="welcome-message">👋 Hello, {username}!</p>
                <button className="btn secondary-btn" onClick={handleLearnMore}>
                  Learn More
                </button>
              </>
            ) : (
              <>
                <button className="btn primary-btn" onClick={() => navigate("/register")}>
                  Get Started
                </button>
                <button className="btn secondary-btn" onClick={handleLearnMore}>
                  Learn More
                </button>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Carousel for Disaster Trends */}
      <div className="carousel-container">
        <h2 className="carousel-title">Latest Trends & Insights</h2>
        <div className="carousel-slide">
          <img src={slides[currentSlide].img} alt={slides[currentSlide].title} className="carousel-image" />
          <div className="slide-text">
            <h3>{slides[currentSlide].title}</h3>
            <p>{slides[currentSlide].desc}</p>
            <button className="btn explore-btn" onClick={() => navigate(slides[currentSlide].link)}>
              Explore
            </button>
          </div>
        </div>
      </div>

      {/* Service Overview Section */}
      <div className="service-overview" ref={serviceRef}>
        <h2 className="service-title">Select a Service for Prediction</h2>
        <div className={`service-container ${selectedModel ? "expanded" : ""}`}>
          {/* Service List */}
          <div className="service-list">
            {["Earthquake", "Wildfire", "Tornado", "Hurricane"].map((model) => (
              <button
                key={model}
                className={`service-btn ${selectedModel === model ? "active" : ""}`}
                onClick={() => handleServiceClick(model)}
              >
                {model}
              </button>
            ))}
          </div>

          {/* Service Details */}
          <div className="service-details">
            {selectedModel && (
              <>
                <h3>{selectedModel} Prediction Model</h3>
                <p>Upload {selectedModel} data (CSV) to generate predictions.</p>
                {username ? (
                  <>
                    <input type="file" accept=".csv" onChange={handleFileUpload} ref={fileInputRef}/>
                    {file && (
                      <button className="btn generate-btn" onClick={handleGenerateReport} disabled={loading}>
                        {loading ? "Processing..." : "Generate Report"}
                      </button>
                    )}
                    {/* How It Works Button */}
                <button className="btn how-it-works-btn" onClick={() => setShowModal(true)}>
                  📘 How This Works
                </button>

                    {/* Show Download Links */}
                    {downloadLinks && (
                      <div className="download-links">
                        <p><a href={downloadLinks.csv_file} target="_blank" rel="noopener noreferrer" style={{ color: "white", textDecoration: "none" }} >📥 Download Predicted CSV</a></p>
                        <p><a href={downloadLinks.pdf_file} target="_blank" rel="noopener noreferrer" style={{ color: "white", textDecoration: "none" }} >📥 Download Report</a></p>
                      </div>
                    )}
                  </>
                ) : (
                  <p className="login-prompt">🔒 Please log in to upload files.</p>
                )}

                {/* Display Required Features for Each Model */}
                {selectedModel === "Wildfire" && (
                  <div className="feature-requirements">
                    <h4>🔥 Required Features for Wildfire Prediction</h4>
                    <ul>
                      <li><strong>latitude, longitude:</strong> Fire location (Geospatial data).</li>
                      <li><strong>bright_ti4, bright_ti5:</strong> Brightness temperature (Fire heat levels).</li>
                      <li><strong>scan, track:</strong> Satellite scanning width and angle.</li>
                      <li><strong>acq_date, acq_time:</strong> Date & time of fire detection.</li>
                      <li><strong>satellite, instrument:</strong> Data source (MODIS/VIIRS satellites).</li>
                      <li><strong>confidence:</strong> Fire detection confidence (low, nominal, high).</li>
                      <li><strong>frp:</strong> Fire Radiative Power (Indicates fire intensity).</li>
                      <li><strong>daynight:</strong> Whether the fire was detected during the day or night.</li>
                    </ul>
                  </div>
                )}

                {selectedModel === "Earthquake" && (
                  <div className="feature-requirements">
                    <h4>🌍 Required Features for Earthquake Prediction</h4>
                    <ul>
                      <li><strong>latitude, longitude:</strong> Earthquake epicenter location.</li>
                      <li><strong>depth:</strong> Depth of the earthquake (in km).</li>
                      <li><strong>magnitude:</strong> Earthquake magnitude on the Richter scale.</li>
                      <li><strong>acq_date:</strong> Date of occurrence.</li>
                      <li><strong>region:</strong> Geographic region of the earthquake.</li>
                    </ul>
                  </div>
                )}

                {selectedModel === "Tornado" && (
                  <div className="feature-requirements">
                    <h4>🌪 Required Features for Tornado Prediction</h4>
                    <ul>
                      <li><strong>latitude, longitude:</strong> Tornado location.</li>
                      <li><strong>wind_speed:</strong> Wind speed in km/h or mph.</li>
                      <li><strong>pressure:</strong> Atmospheric pressure (if available).</li>
                      <li><strong>acq_date:</strong> Date of tornado event.</li>
                      <li><strong>severity:</strong> Tornado damage scale (EF-Scale).</li>
                    </ul>
                  </div>
                )}


                {selectedModel === "Hurricane" && (
                  <div className="feature-requirements">
                    <h4>🌀 Required Features for Hurricane Prediction</h4>
                    <ul>
                      <li><strong>latitude, longitude:</strong> Hurricane location.</li>
                      <li><strong>wind_speed:</strong> Sustained wind speed in km/h.</li>
                      <li><strong>pressure:</strong> Atmospheric pressure in mb.</li>
                      <li><strong>humidity:</strong> Humidity levels in percentage.</li>
                      <li><strong>acq_date:</strong> Date of hurricane occurrence.</li>
                      <li><strong>storm_category:</strong> Hurricane category (1-5).</li>
                    </ul>
                  </div>
                )}

                
              </>
            )}
          </div>
        </div>
      </div>

      {/* Modal Popup */}
      {showModal && (
        <div className="modal-backdrop" onClick={() => setShowModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <h3>{selectedModel} Model – How It Works</h3>
            <pre>{modelDescriptions[selectedModel]}</pre>
            <button className="btn close-modal-btn" onClick={() => setShowModal(false)}>
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default Hero;
