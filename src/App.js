import React, { useState, useEffect } from "react";
import "./App.css";
import Meditation from "./Meditation";
import { Routes, Route, useNavigate } from "react-router-dom";
import MoodTracker from "./MoodTracker";
import SelfHelp from "./SelfHelp";
import Signup from "./pages/Signup";
import Login from "./pages/Login";
import MoodHistory from "./MoodHistory";


function Dashboard() {

  const navigate = useNavigate();

  return (
    <div className="dashboard">

      <div className="cards">

        <div className="card">
          🧘
          <h3>Meditation</h3>
          <button onClick={() => navigate("/meditation")}>
            Start Meditation
          </button>
        </div>

        <div className="card">
          😊
          <h3>Mood Tracker</h3>
          <button onClick={() => navigate("/mood-tracker")}>
            Track Mood
          </button>
        </div>

        <div className="card">
          📖
          <h3>Self Help</h3>
          <button onClick={() => navigate("/self-help")}>
            Open Self Help
          </button>
        </div>

      </div>

    </div>
  );
}


function App() {

  return (
    <Routes>

      {/* LOGIN/ SIGNUP PAGE */}
      <Route path="/" element={<Login />} />
      <Route path="/signup" element={<Signup />} />

      {/* DASHBOARD */}
      <Route path="/dashboard" element={<Dashboard />} />

      {/* FEATURE PAGES */}
      <Route path="/meditation" element={<Meditation />} />

      <Route path="/mood-tracker" element={<MoodTracker />} />

      <Route path="/self-help" element={<SelfHelp />} />

      <Route path="/history" element={<MoodHistory />} />

    </Routes>
  );
}

export default App;
