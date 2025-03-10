import React from "react";
import { Routes, Route } from "react-router-dom";
import Navbar from "./components/Navbar";
import Hero from "./components/Hero";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Earthquake from "./pages/Earthquake";
import Wildfire from "./pages/Wildfire";
import Hurricane from "./pages/Hurricane";
import Tornado from "./pages/Tornado";
import Terrorism from "./pages/Terrorism";
import Alerts from "./pages/Alerts";
import Account from "./pages/Account"; // ✅ Import the Account component properly
import VerifyEmail from "./pages/VerifyEmail";
import ForgotPassword from "./pages/ForgotPassword";





function App() {
  return (
    <>
      <Navbar />
      <Routes>
        <Route path="/" element={<Hero />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/nature/earthquake" element={<Earthquake />} />
        <Route path="/nature/wildfire" element={<Wildfire />} />
        <Route path="/nature/hurricane" element={<Hurricane />} />
        <Route path="/nature/tornado" element={<Tornado />} />
        <Route path="/terrorism" element={<Terrorism />} />
        <Route path="/alerts" element={<Alerts />} />
        <Route path="/verify-email" element={<VerifyEmail />} />
        <Route path="/account" element={<Account />} />
        <Route path="/forgot-password" element={<ForgotPassword />} /> 
      </Routes>
    </>
  );
}

export default App;
