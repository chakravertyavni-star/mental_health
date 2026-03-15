import React, { useState, useEffect } from "react";
import "./App.css";

function MoodHistory() {

  const [moods, setMoods] = useState([]);

  useEffect(() => {

    const username = localStorage.getItem("username");

    fetch(`http://localhost:5000/api/mood/${username}`)
      .then(res => res.json())
      .then(data => setMoods(data));

  }, []);

  return (

    <div className="pageBackground">

      <h1>Mood History</h1>

      {moods.map((m, index) => (
        <div key={index}>
          {m.mood} — {m.date} {m.time}
        </div>
      ))}

    </div>

  );
}

export default MoodHistory;