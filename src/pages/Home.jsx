import React, { useState, useEffect } from "react";
import "../styles/Hero.css"; // Reuse the Hero styles

const Home = () => {
  const [username, setUsername] = useState(null);

  useEffect(() => {
    // Check if user is logged in (Replace with actual auth logic)
    const storedUser = localStorage.getItem("username");
    if (storedUser) {
      setUsername(storedUser);
    }
  }, []);

  return (
    <div className="hero">
      <div className="hero-content">
        <h1>ForeSight</h1>
        <p>Predicting disasters ahead</p>

        {username ? (
          <h2>Welcome, {username}!</h2>
        ) : (
          <div className="buttons">
            <a href="/login" className="btn">Login</a>
            <a href="/register" className="btn">Signup</a>
          </div>
        )}
      </div>
    </div>
  );
};

export default Home;
