import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Navbar from "./components/Navbar";
import Home from "./pages/Home";
import Hero from "./pages/Hero";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Earthquake from "./pages/Earthquake";
import Wildfire from "./pages/Wildfire";
import Hurricane from "./pages/Hurricane";
import Tornado from "./pages/Tornado";
import Terrorism from "./pages/Terrorism";
import Alerts from "./pages/Alerts";

function App() {
  return (
    <Router basename="/FS"> {/* ✅ Fix: Set basename to match GitHub repo */}
      <Navbar />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/hero" element={<Hero />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/nature/earthquake" element={<Earthquake />} />
        <Route path="/nature/wildfire" element={<Wildfire />} />
        <Route path="/nature/hurricane" element={<Hurricane />} />
        <Route path="/nature/tornado" element={<Tornado />} />
        <Route path="/terrorism" element={<Terrorism />} />
        <Route path="/alerts" element={<Alerts />} />
      </Routes>
    </Router>
  );
}

export default App;
