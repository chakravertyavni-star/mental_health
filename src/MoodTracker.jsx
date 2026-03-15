import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import "./App.css";
import "./MoodTracker.css";

function MoodTracker() {

  const [mood, setMood] = useState("");
  const navigate = useNavigate();

  const saveMood = async () => {

    const username = localStorage.getItem("username");

    await fetch("http://localhost:5000/api/mood/save", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        username,
        mood
      })
    });

    alert("Mood saved!");

  };

  return (
    <div className="pageBackground">

      <h1>Mood Tracker</h1>
      <p>How are you feeling today?</p>

      <div className="moods">

        <button onClick={() => setMood("Happy")}>🙂 Happy</button>
        <button onClick={() => setMood("Neutral")}>😐 Neutral</button>
        <button onClick={() => setMood("Sad")}>😔 Sad</button>
        <button onClick={() => setMood("Stressed")}>😣 Stressed</button>

      </div>

      {mood && (
        <div className="result">
          <h2>You selected: {mood}</h2>

          <button onClick={saveMood} className="saveBtn">
            Save Mood
          </button>

        </div>
      )}


      {/* HISTORY BUTTON */}
      <div className="historyButton">

        <button onClick={() => navigate("/history")}>
          View Mood History
        </button>

      </div>

    </div>
  );
}

export default MoodTracker;
