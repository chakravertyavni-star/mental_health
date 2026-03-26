import React, { useEffect, useMemo, useState } from "react";
import "./HabitTracker.css";
import { showPopup } from "./popup/showPopup";

const STORAGE_HABITS = "habitTrackerHabits_v1";
const STORAGE_HISTORY = "habitTrackerHistory_v1";

const getLocalDateKey = () => {
  const d = new Date();
  const y = d.getFullYear();
  const m = `${d.getMonth() + 1}`.padStart(2, "0");
  const day = `${d.getDate()}`.padStart(2, "0");
  return `${y}-${m}-${day}`;
};

const defaultHabits = [
  { id: "water", name: "Drank enough water" },
  { id: "exercise", name: "Exercised" },
  { id: "meditated", name: "Meditated" },
  { id: "journaled", name: "Journaled" },
  { id: "slept", name: "Slept on time" },
];

function HabitTracker() {
  const [habits, setHabits] = useState(() => {
    try {
      const raw = localStorage.getItem(STORAGE_HABITS);
      if (!raw) return defaultHabits;
      const parsed = JSON.parse(raw);
      if (!Array.isArray(parsed) || parsed.length === 0) return defaultHabits;
      // Backfill missing fields.
      return parsed.map((h) => ({ ...h, isCustom: !!h.isCustom }));
    } catch {
      return defaultHabits;
    }
  });

  const [historyByDate, setHistoryByDate] = useState(() => {
    try {
      const raw = localStorage.getItem(STORAGE_HISTORY);
      if (!raw) return {};
      const parsed = JSON.parse(raw);
      if (!parsed || typeof parsed !== "object") return {};
      return parsed;
    } catch {
      return {};
    }
  });

  const [todayKey, setTodayKey] = useState(() => getLocalDateKey());
  const [newHabitName, setNewHabitName] = useState("");

  // Keep the "today" key fresh if the tab stays open overnight.
  useEffect(() => {
    const t = setInterval(() => setTodayKey(getLocalDateKey()), 30000);
    return () => clearInterval(t);
  }, []);

  const completedIds = useMemo(() => {
    const entry = historyByDate?.[todayKey];
    const arr = Array.isArray(entry?.completedIds) ? entry.completedIds : [];
    return new Set(arr);
  }, [historyByDate, todayKey]);

  const progress = useMemo(() => {
    if (!habits.length) return 0;
    const completed = Array.from(completedIds).filter((id) => habits.some((h) => h.id === id)).length;
    return Math.round((completed / habits.length) * 100);
  }, [completedIds, habits]);

  const toggleHabit = (id) => {
    const nextSet = new Set(Array.isArray(historyByDate?.[todayKey]?.completedIds) ? historyByDate[todayKey].completedIds : []);
    if (nextSet.has(id)) nextSet.delete(id);
    else nextSet.add(id);

    const nextHistory = {
      ...historyByDate,
      [todayKey]: {
        completedIds: Array.from(nextSet),
      },
    };
    setHistoryByDate(nextHistory);
    localStorage.setItem(STORAGE_HISTORY, JSON.stringify(nextHistory));
  };

  const addCustomHabit = () => {
    const name = newHabitName.trim();
    if (!name) return;
    const normalized = name.toLowerCase();

    const exists = habits.some((h) => h.name?.toLowerCase?.() === normalized);
    if (exists) {
      showPopup({ title: "NeuralFort", message: "That habit already exists.", kind: "error" });
      return;
    }

    const id = `custom-${Date.now()}`;
    const nextHabits = [...habits, { id, name, isCustom: true }];
    setHabits(nextHabits);
    localStorage.setItem(STORAGE_HABITS, JSON.stringify(nextHabits));
    setNewHabitName("");
  };

  return (
    <div className="pageBackground habitRoot">
      <div className="habitHeader">
        <h1>Habit Tracker</h1>
        <p>Small steps, every day.</p>
      </div>

      <div className="habitProgressCard">
        <div className="habitProgressTop">
          <div className="habitProgressLabel">Today&apos;s progress</div>
          <div className="habitProgressPct">{progress}%</div>
        </div>
        <div className="habitProgressBar" aria-hidden="true">
          <div className="habitProgressFill" style={{ width: `${progress}%` }} />
        </div>
      </div>

      <div className="habitGrid">
        {habits.map((h) => {
          const isDone = completedIds.has(h.id);
          return (
            <div key={h.id} className="habitCard">
              <div className="habitCardLeft">
                <div className={`habitDot ${isDone ? "done" : ""}`} aria-hidden="true" />
                <div className="habitName">{h.name}</div>
              </div>
              <label className="habitToggle">
                <input
                  type="checkbox"
                  checked={isDone}
                  onChange={() => toggleHabit(h.id)}
                  aria-label={`Mark ${h.name} as ${isDone ? "not completed" : "completed"}`}
                />
                <span className="habitSwitch" aria-hidden="true" />
              </label>
            </div>
          );
        })}
      </div>

      <div className="habitAddCard">
        <div className="habitAddTitle">Add Custom Habit</div>
        <div className="habitAddRow">
          <input
            type="text"
            value={newHabitName}
            placeholder="e.g., Took a short walk"
            onChange={(e) => setNewHabitName(e.target.value)}
            className="habitInput"
          />
          <button type="button" className="habitAddBtn" onClick={addCustomHabit}>
            Add
          </button>
        </div>
        <div className="habitAddHelp">Completion resets daily and is saved for this date.</div>
      </div>
    </div>
  );
}

export default HabitTracker;

