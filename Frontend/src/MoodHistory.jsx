import React, { useState, useEffect } from "react";
import "./App.css";

function MoodHistory() {
  const [moods, setMoods] = useState([]);

  useEffect(() => {
    const localMeditationMoods = JSON.parse(localStorage.getItem("moodHistoryLocal") || "[]");

    const getEntryTime = (m) => {
      if (m.timestamp) {
        const t = new Date(m.timestamp).getTime();
        return Number.isNaN(t) ? null : t;
      }
      const dt = new Date(`${m.date || ""} ${m.time || ""}`).getTime();
      return Number.isNaN(dt) ? null : dt;
    };

    const merged = Array.isArray(localMeditationMoods) ? localMeditationMoods : [];
    merged.sort((a, b) => {
      const aT = getEntryTime(a) ?? 0;
      const bT = getEntryTime(b) ?? 0;
      return bT - aT;
    });

    setMoods(merged);
  }, []);

  return (
    <div className="pageBackground">
      <h1>Mood History</h1>
      {moods.length > 0 ? (
        moods.map((m, index) => (
          <div key={index} style={{ padding: "10px", color: "white", fontSize: "14px" }}>
            {m.mood} — {m.date} {m.time}
            {m.context === "post_meditation" ? " (post meditation)" : ""}
          </div>
        ))
      ) : (
        <p style={{ color: "rgba(255,255,255,0.7)" }}>No mood entries yet</p>
      )}
    </div>
  );
}

export default MoodHistory;