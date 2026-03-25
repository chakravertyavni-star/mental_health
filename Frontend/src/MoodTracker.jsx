import React, { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import "./MoodTracker.css";
import { showPopup } from "./popup/showPopup";

function MoodTracker() {
  const [mood, setMood] = useState("");
  const [intensity, setIntensity] = useState(50);
  const [reason, setReason] = useState("");
  const navigate = useNavigate();

  const moodReasons = {
    Happy: [
      "Achievement",
      "Social connection",
      "Relaxation",
      "Personal growth",
      "Gratitude"
    ],
    Neutral: [
      "Routine day",
      "Low energy",
      "No strong emotions",
      "Boredom",
      "Mentally tired"
    ],
    Sad: [
      "Academic pressure",
      "Work stress",
      "Relationships",
      "Overthinking",
      "Missing someone",
      "Nostalgia",
      "No clear reason"
    ],
    Stressed: [
      "Too much work",
      "Deadlines",
      "Lack of control",
      "Multitasking chaos",
      "Performance pressure"
    ],
    Anxious: [
      "Multitasking chaos",
      "Performance pressure",
      "Future uncertainty",
      "Fear of failure",
      "Social anxiety",
      "Overthinking worst-case scenarios",
      "Health concerns"
    ],
    Angry: [
      "Conflict with someone",
      "Things not going your way",
      "Feeling misunderstood",
      "Lack of progress",
      "External pressure"
    ],
    Tired: [
      "Lack of sleep",
      "Mental exhaustion",
      "Too much screen time",
      "No breaks",
      "Overworking"
    ],
    Lonely: [
      "No one to talk to",
      "Missing friends/family",
      "Feeling misunderstood",
      "Social isolation",
      "Comparing with others"
    ]
  };

  const moodEmojis = {
    Happy: "🙂",
    Neutral: "😐",
    Sad: "😔",
    Stressed: "😣",
    Anxious: "😰",
    Angry: "😠",
    Tired: "😴",
    Lonely: "🥺"
  };

  const moodList = Object.keys(moodEmojis);
  const currentReasons = mood ? moodReasons[mood] : [];

  const [moodHistory, setMoodHistory] = useState([]);
  const [analyticsDays, setAnalyticsDays] = useState(7); // 7 or 30
  const [trendGranularity, setTrendGranularity] = useState("daily"); // 'daily' or 'weekly'
  const [analyticsLoading, setAnalyticsLoading] = useState(false);

  const parseEntryTime = (entry) => {
    if (entry.timestamp) {
      const t = new Date(entry.timestamp).getTime();
      return Number.isNaN(t) ? null : t;
    }
    const dt = new Date(`${entry.date || ""} ${entry.time || ""}`).getTime();
    return Number.isNaN(dt) ? null : dt;
  };

  const refreshMoodHistory = async () => {
    setAnalyticsLoading(true);
    try {
      const localMeditationMoods = JSON.parse(localStorage.getItem("moodHistoryLocal") || "[]");
      const merged = Array.isArray(localMeditationMoods) ? localMeditationMoods : [];
      merged.sort((a, b) => {
        const aT = parseEntryTime(a) ?? 0;
        const bT = parseEntryTime(b) ?? 0;
        return bT - aT;
      });
      setMoodHistory(merged);
    } finally {
      setAnalyticsLoading(false);
    }
  };

  useEffect(() => {
    refreshMoodHistory();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const saveMood = async () => {
    const username = localStorage.getItem("username");
    if (!username) {
      showPopup({ title: "NeuralFort", message: "Please log in to save moods.", kind: "error" });
      return;
    }
    if (!mood || !reason) {
      showPopup({ title: "NeuralFort", message: "Please select a mood and a reason.", kind: "error" });
      return;
    }

    const timestamp = new Date();
    const entry = {
      id: `mood-${Date.now()}`,
      mood,
      intensity,
      reason,
      date: timestamp.toLocaleDateString("en-US"),
      time: timestamp.toLocaleTimeString("en-US", {
        hour: "2-digit",
        minute: "2-digit",
      }),
      timestamp: timestamp.toISOString(),
      source: "mood_tracker",
      context: "mood_tracker",
    };

    const prev = JSON.parse(localStorage.getItem("moodHistoryLocal") || "[]");
    const next = Array.isArray(prev) ? [entry, ...prev] : [entry];
    localStorage.setItem("moodHistoryLocal", JSON.stringify(next));

    showPopup({ title: "NeuralFort", message: "Mood saved!", kind: "success" });
    setMood("");
    setIntensity(50);
    setReason("");
    refreshMoodHistory();
  };

  const getIntensityLabel = () => {
    if (intensity <= 20) return "Very Light";
    if (intensity <= 40) return "Light";
    if (intensity <= 60) return "Moderate";
    if (intensity <= 80) return "Strong";
    return "Extreme";
  };

  const toDateKey = (t) => {
    const d = new Date(t);
    const y = d.getFullYear();
    const m = `${d.getMonth() + 1}`.padStart(2, "0");
    const day = `${d.getDate()}`.padStart(2, "0");
    return `${y}-${m}-${day}`;
  };

  const toISOWeekKey = (t) => {
    // ISO week number derived from UTC to keep stable across timezones.
    const d = new Date(t);
    const dateUTC = new Date(Date.UTC(d.getFullYear(), d.getMonth(), d.getDate()));
    // Set to nearest Thursday: current date + 4 - day number
    const dayNum = dateUTC.getUTCDay() || 7;
    dateUTC.setUTCDate(dateUTC.getUTCDate() + 4 - dayNum);
    const isoYear = dateUTC.getUTCFullYear();
    const yearStart = new Date(Date.UTC(isoYear, 0, 1));
    const weekNo = Math.ceil(((dateUTC - yearStart) / 86400000 + 1) / 7);
    return `${isoYear}-W${String(weekNo).padStart(2, "0")}`;
  };

  const analyticsMoods = useMemo(() => {
    const seen = new Set(moodList);
    const extras = [];
    moodHistory.forEach((e) => {
      if (e?.mood && !seen.has(e.mood)) {
        seen.add(e.mood);
        extras.push(e.mood);
      }
    });
    return [...moodList, ...extras];
  }, [moodHistory, moodList]);

  const filteredMoodEntries = useMemo(() => {
    const now = Date.now();
    const cutoff = now - analyticsDays * 24 * 60 * 60 * 1000;
    return moodHistory
      .map((e) => ({ entry: e, t: parseEntryTime(e) }))
      .filter((x) => x.t !== null && x.t >= cutoff)
      .sort((a, b) => a.t - b.t)
      .map((x) => ({ ...x.entry, _t: x.t }));
  }, [analyticsDays, moodHistory]);

  const trendPoints = useMemo(() => {
    if (!filteredMoodEntries.length) return [];
    const groups = new Map(); // key -> { t, mood }
    for (const e of filteredMoodEntries) {
      const key = trendGranularity === "daily" ? toDateKey(e._t) : toISOWeekKey(e._t);
      // Because entries are sorted ascending, overwriting gives the last mood for that bucket.
      groups.set(key, { t: e._t, mood: e.mood });
    }
    return Array.from(groups.values()).sort((a, b) => a.t - b.t);
  }, [filteredMoodEntries, trendGranularity]);

  const graphModel = useMemo(() => {
    const width = 300;
    const height = 160;
    const padX = 26;
    const padTop = 18;
    const padBottom = 26;
    const graphW = width - padX * 2;
    const graphH = height - padTop - padBottom;

    const n = trendPoints.length;
    if (n === 0) return null;

    const maxIdx = Math.max(analyticsMoods.length - 1, 1);
    const pts = trendPoints.map((p, i) => {
      const idx = analyticsMoods.indexOf(p.mood);
      const valueIdx = idx < 0 ? 0 : idx;
      const x = n === 1 ? padX + graphW / 2 : padX + (graphW * i) / (n - 1);
      const y = padTop + (1 - valueIdx / maxIdx) * graphH;
      return { x, y, mood: p.mood, t: p.t };
    });

    const buildSmoothPath = (points) => {
      if (points.length < 2) return "";
      const d = [`M ${points[0].x} ${points[0].y}`];
      for (let i = 0; i < points.length - 1; i++) {
        const p0 = points[i - 1] || points[i];
        const p1 = points[i];
        const p2 = points[i + 1];
        const p3 = points[i + 2] || p2;
        const cp1x = p1.x + (p2.x - p0.x) / 6;
        const cp1y = p1.y + (p2.y - p0.y) / 6;
        const cp2x = p2.x - (p3.x - p1.x) / 6;
        const cp2y = p2.y - (p3.y - p1.y) / 6;
        d.push(`C ${cp1x} ${cp1y}, ${cp2x} ${cp2y}, ${p2.x} ${p2.y}`);
      }
      return d.join(" ");
    };

    return {
      width,
      height,
      padX,
      padTop,
      pts,
      pathD: buildSmoothPath(pts),
    };
  }, [analyticsMoods, trendPoints]);

  const distribution = useMemo(() => {
    if (!filteredMoodEntries.length) return [];
    const counts = new Map();
    for (const e of filteredMoodEntries) {
      if (!e?.mood) continue;
      counts.set(e.mood, (counts.get(e.mood) || 0) + 1);
    }
    const total = filteredMoodEntries.length || 1;
    const rows = Array.from(counts.entries()).map(([m, count]) => ({
      mood: m,
      count,
      pct: Math.round((count / total) * 100),
    }));
    rows.sort((a, b) => b.count - a.count);
    return rows;
  }, [filteredMoodEntries]);

  return (
    <div className="pageBackground">
      <h1>Check in with yourself</h1>
      <p>How are you feeling today?</p>

      <div className="moods">
        {moodList.map((m) => (
          <button
            key={m}
            onClick={() => setMood(m)}
            className={mood === m ? "active" : ""}
          >
            {moodEmojis[m]} {m}
          </button>
        ))}
      </div>

      {mood && (
        <div className="result">
          <h2>You selected: {mood}</h2>

          <div className="intensitySection">
            <h3>How intense is this feeling?</h3>
            <div className="intensityDisplay">
              <span className="moodIndicator">{moodEmojis[mood]} Light</span>
              <span className="intensityLabel">{getIntensityLabel()}</span>
              <span className="moodIndicator">Extreme {moodEmojis[mood]}</span>
            </div>
            <input
              type="range"
              min="0"
              max="100"
              value={intensity}
              onChange={(e) => setIntensity(parseInt(e.target.value))}
              className="intensitySlider"
            />
            <p className="intensityValue">Intensity: {intensity}%</p>
          </div>

          <div className="whySection">
            <h3>Why are you feeling this way?</h3>
            <div className="reasonButtons">
              {currentReasons.map((r, index) => (
                <button
                  key={index}
                  onClick={() => setReason(r)}
                  className={`reasonBtn ${reason === r ? "active" : ""}`}
                >
                  {r}
                </button>
              ))}
            </div>
            {reason && <p className="selectedReason">Selected: {reason}</p>}
          </div>

          <button onClick={saveMood} className="saveBtn">
            Save Mood
          </button>
        </div>
      )}

      <div className="analyticsSection">
        <h2 className="analyticsTitle">Mood Analytics</h2>

        <div className="analyticsControls">
          <div className="analyticsFilterGroup">
            <button
              type="button"
              className={`analyticsPill ${analyticsDays === 7 ? "active" : ""}`}
              onClick={() => setAnalyticsDays(7)}
            >
              Last 7 days
            </button>
            <button
              type="button"
              className={`analyticsPill ${analyticsDays === 30 ? "active" : ""}`}
              onClick={() => setAnalyticsDays(30)}
            >
              Last 30 days
            </button>
          </div>

          <div className="analyticsTrendGroup">
            <button
              type="button"
              className={`analyticsPill ${trendGranularity === "daily" ? "active" : ""}`}
              onClick={() => setTrendGranularity("daily")}
            >
              Daily
            </button>
            <button
              type="button"
              className={`analyticsPill ${trendGranularity === "weekly" ? "active" : ""}`}
              onClick={() => setTrendGranularity("weekly")}
            >
              Weekly
            </button>
          </div>
        </div>

        {analyticsLoading ? (
          <div className="analyticsLoading">Loading mood data…</div>
        ) : (
          <>
            <div className="analyticsGrid">
              <div className="analyticsCard">
                <div className="analyticsCardTitle">Mood Trend</div>
                {graphModel ? (
                  <svg
                    className="analyticsGraph"
                    viewBox={`0 0 ${graphModel.width} ${graphModel.height}`}
                    role="img"
                    aria-label="Mood trend graph"
                  >
                    <path
                      d={graphModel.pathD}
                      fill="none"
                      stroke="url(#trendGrad)"
                      strokeWidth="3"
                      strokeLinecap="round"
                    />
                    {graphModel.pts.map((p, idx) => (
                      <circle
                        key={`${p.t}-${idx}`}
                        cx={p.x}
                        cy={p.y}
                        r="4.2"
                        fill="rgba(255,255,255,0.92)"
                        stroke="rgba(106,90,205,0.9)"
                        strokeWidth="2"
                      />
                    ))}
                    <defs>
                      <linearGradient id="trendGrad" x1="0" y1="0" x2="300" y2="0">
                        <stop offset="0%" stopColor="#6a5acd" stopOpacity="1" />
                        <stop offset="100%" stopColor="#3b82f6" stopOpacity="1" />
                      </linearGradient>
                    </defs>
                  </svg>
                ) : (
                  <div className="analyticsEmpty">No enough data yet.</div>
                )}
              </div>

              <div className="analyticsCard">
                <div className="analyticsCardTitle">Mood Distribution</div>
                {distribution.length ? (
                  <div className="distributionList">
                    {distribution.map((row) => (
                      <div key={row.mood} className="distRow">
                        <div className="distLabel">{row.mood}</div>
                        <div className="distBar" aria-hidden="true">
                          <div className="distFill" style={{ width: `${row.pct}%` }} />
                        </div>
                        <div className="distPct">{row.pct}%</div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="analyticsEmpty">No mood entries in this range yet.</div>
                )}
              </div>
            </div>
          </>
        )}
      </div>

      <button onClick={() => navigate("/history")} className="historyButton">
        View Mood History
      </button>
    </div>
  );
}

export default MoodTracker;
