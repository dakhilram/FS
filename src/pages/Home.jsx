import React, { useState } from "react";
import { Link } from "react-router-dom";
import "../styles/Hero.css";

const Home = () => {
  const [username, setUsername] = useState(localStorage.getItem("username") || null);
  const [file, setFile] = useState(null);
  const [fileContent, setFileContent] = useState("");

  const handleFileChange = (event) => {
    const uploadedFile = event.target.files[0];

    if (uploadedFile) {
      setFile(uploadedFile);

      // ✅ Preview content if JSON or CSV
      const reader = new FileReader();
      reader.onload = (e) => {
        const text = e.target.result;
        if (uploadedFile.type === "application/json") {
          try {
            const jsonPreview = JSON.parse(text);
            setFileContent(JSON.stringify(jsonPreview, null, 2)); // Pretty print JSON
          } catch (error) {
            setFileContent("Invalid JSON file.");
          }
        } else if (uploadedFile.type === "text/csv") {
          setFileContent(text.split("\n").slice(0, 5).join("\n")); // Show first 5 lines
        } else {
          setFileContent("Unsupported file format.");
        }
      };
      reader.readAsText(uploadedFile);
    }
  };

  return (
    <div className="hero">
      <div className="hero-content">
        <h1>ForeSight</h1>
        <p>Predicting disasters ahead</p>

        {username ? (
          <>
            <h2>Welcome, {username}!</h2>
            {/* ✅ File Upload Section */}
            <div className="file-upload">
              <label>Upload JSON or CSV:</label>
              <input type="file" accept=".json, .csv" onChange={handleFileChange} />
              
              {file && (
                <div className="file-preview">
                  <p><strong>File Name:</strong> {file.name}</p>
                  <pre>{fileContent}</pre> {/* ✅ Show Preview */}
                </div>
              )}
              <button className="btn">Generate Report</button> {/* Action Later */}
            </div>
          </>
        ) : (
          <div className="buttons">
            <Link to="/login" className="btn">Login</Link>
            <Link to="/register" className="btn">Signup</Link>
          </div>
        )}
      </div>
    </div>
  );
};

export default Home;
