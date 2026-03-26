import React from "react";
import "./App.css";
import Meditation from "./Meditation";
import { Routes, Route, useNavigate } from "react-router-dom";
import MoodTracker from "./MoodTracker";
import HabitTracker from "./HabitTracker";
import Signup from "./pages/Signup";
import Login from "./pages/Login";
import MoodHistory from "./MoodHistory";
import Journal from "./Journal";
import PopupLayer from "./popup/PopupLayer";
import Chatbot from "./Chatbot";


function Dashboard() {

  const navigate = useNavigate();

  return (
    <div className="dashboard">
      <div
        className="dailyCompanion"
        role="button"
        tabIndex={0}
        onClick={() => navigate("/chatbot")}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === " ") navigate("/chatbot");
        }}
      >
        <h2>Daily Companion 💭</h2>
        <p>Share your thoughts and feelings</p>
        <form
          onSubmit={(e) => {
            e.preventDefault();
            navigate("/chatbot");
          }}
        >
          <input
            type="text"
            placeholder="Talk to me…"
            className="companionInput"
            onClick={(e) => {
              e.preventDefault();
              navigate("/chatbot");
            }}
            onFocus={() => navigate("/chatbot")}
          />
          <button type="submit" className="companionBtn">
            Open Chat
          </button>
        </form>
      </div>

      <div className="cards">
        <div className="card" onClick={() => navigate("/meditation")}>
          🧘
          <h3>Meditation</h3>
          <p>Start your relaxation journey</p>
        </div>

        <div className="card" onClick={() => navigate("/mood-tracker")}>
          😊
          <h3>Mood Tracker</h3>
          <p>Track and understand your emotions</p>
        </div>

        <div className="card" onClick={() => navigate("/journal", { state: { from: "/dashboard" } })}>
          📔
          <h3>Journal</h3>
          <p>Read your meditation reflections</p>
        </div>

        <div className="card" onClick={() => navigate("/habit-tracker")}>
          ✅
          <h3>Habit Tracker</h3>
          <p>Build calm, day by day</p>
        </div>
      </div>
    </div>
  );
}


function App() {
  return (
    <>
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/chatbot" element={<Chatbot />} />
        <Route path="/meditation" element={<Meditation />} />
        <Route path="/mood-tracker" element={<MoodTracker />} />
        <Route path="/history" element={<MoodHistory />} />
        <Route path="/habit-tracker" element={<HabitTracker />} />
        <Route path="/journal/:date?" element={<Journal />} />
      </Routes>
      <PopupLayer />
    </>
  );
}

export default App;
