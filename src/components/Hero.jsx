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
    setFile(null);
    setDownloadLinks(null);
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
                    <input type="file" accept=".csv" onChange={handleFileUpload} />
                    {file && (
                      <button className="btn generate-btn" onClick={handleGenerateReport} disabled={loading}>
                        {loading ? "Processing..." : "Generate Report"}
                      </button>
                    )}

                    {/* Show Download Links */}
                    {downloadLinks && (
                      <div className="download-links">
                        <p><a href={downloadLinks.csv_file} target="_blank" rel="noopener noreferrer">📥 Download Predicted CSV</a></p>
                        <p><a href={downloadLinks.pdf_file} target="_blank" rel="noopener noreferrer">📥 Download Report</a></p>
                      </div>
                    )}
                  </>
                ) : (
                  <p className="login-prompt">🔒 Please log in to upload files.</p>
                )}
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Hero;
