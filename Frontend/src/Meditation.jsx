import React, { useState, useEffect } from "react";
import "./Meditation.css";
import { showPopup } from "./popup/showPopup";

function Meditation() {
  const [view, setView] = useState("selection");
  const [selectedMeditation, setSelectedMeditation] = useState(null);
  // Fixed session length (since the UI no longer provides duration buttons).
  const [duration, setDuration] = useState(1);
  const [timeLeft, setTimeLeft] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [breathingPhase, setBreathingPhase] = useState("inhale");
  const [audioType, setAudioType] = useState("rain");
  const [volume, setVolume] = useState(50);
  const [hasStarted, setHasStarted] = useState(false);
  const [reflection, setReflection] = useState("");
  const [postMood, setPostMood] = useState("");
  const meditations = {
    Relax: [
      {
        id: "visualization",
        name: "Visualization",
        emoji: "🌌",
        instruction: [
          "Imagine yourself in a calm, peaceful place.",
          "Notice the sounds, हवा, and surroundings.",
          "Let yourself fully experience this moment.",
        ],
      },
      {
        id: "progressive",
        name: "Progressive Relaxation",
        emoji: "😌",
        instruction: [
          "Gently tense and relax each part of your body.",
          "Start from your toes and move upward slowly.",
          "Notice the difference between tension and relaxation.",
        ],
      },
      {
        id: "guided",
        name: "Guided Meditation",
        emoji: "🧘",
        instruction: [
          "Close your eyes and take slow, deep breaths.",
          "Let your body relax and gently focus on your breathing.",
          "If your mind wanders, softly bring it back.",
        ],
      }
    ],
    Focus: [
      {
        id: "focused",
        name: "Focused Meditation",
        emoji: "🎯",
        instruction: [
          "Focus your attention on a single point — your breath.",
          "Count each inhale and exhale slowly.",
          "If distracted, gently return to your focus.",
        ],
      },
      {
        id: "mindfulness",
        name: "Mindfulness",
        emoji: "🌿",
        instruction: [
          "Observe your thoughts without judging them.",
          "Let them come and go naturally.",
          "Stay present in this moment.",
        ],
      },
      {
        id: "reflection",
        name: "Reflection",
        emoji: "🪞",
        instruction: [
          "Take a moment to think about your day.",
          "Notice what you felt and why.",
          "Write your thoughts freely without overthinking.",
        ],
      }
    ],
  };

  const groundingTechniques = [
    {
      id: "grounding-54321",
      name: "5-4-3-2-1 Method",
      steps: [
        "Name 5 things you can see",
        "Name 4 things you can feel",
        "Name 3 things you can hear",
        "Name 2 things you can smell",
        "Name 1 thing you can taste",
      ],
    },
    {
      id: "grounding-box-breathing",
      name: "Box Breathing",
      steps: [
        "Inhale for 4 seconds",
        "Hold for 4 seconds",
        "Exhale for 4 seconds",
        "Hold for 4 seconds (loop this cycle)",
      ],
    },
    {
      id: "grounding-body-awareness",
      name: "Body Awareness",
      steps: [
        "Notice your feet touching the ground",
        "Feel your posture",
        "Relax your shoulders",
        "Focus on your breathing",
      ],
    },
    {
      id: "grounding-sensory-focus",
      name: "Sensory Focus",
      steps: [
        "Focus on one sound around you",
        "Notice one object in detail",
        "Feel your breathing",
        "Stay present",
      ],
    },
  ];

  const audioSounds = {
    rain: "🌧️ Rain",
    ocean: "🌊 Ocean",
    whitenoise: "🔌 White Noise"
  };

  useEffect(() => {
    if (!isPlaying || timeLeft <= 0) return;

    const timer = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          setIsPlaying(false);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [isPlaying, timeLeft]);

  useEffect(() => {
    if (!isPlaying) return;

    const breathCycle = setInterval(() => {
      setBreathingPhase(prev => (prev === "inhale" ? "exhale" : "inhale"));
    }, 4000);

    return () => clearInterval(breathCycle);
  }, [isPlaying, selectedMeditation]);

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  const clamp = (n, min, max) => Math.max(min, Math.min(max, n));

  const openMeditation = (med) => {
    setSelectedMeditation(med);
    setTimeLeft(0);
    setIsPlaying(false);
    setHasStarted(false);
    setBreathingPhase("inhale");
    setView("player");
  };

  const goBackToSelection = () => {
    setIsPlaying(false);
    setTimeLeft(0);
    setHasStarted(false);
    setSelectedMeditation(null);
    setBreathingPhase("inhale");
    setView("selection");
  };

  const startMeditation = () => {
    setTimeLeft(duration * 60);
    setIsPlaying(true);
    setHasStarted(true);
  };

  const pauseMeditation = () => {
    setIsPlaying(false);
  };

  const resumeMeditation = () => {
    setIsPlaying(true);
  };

  const endSession = () => {
    setIsPlaying(false);
    setTimeLeft(0);
    setHasStarted(false);
    setView("feedback");
  };

  const adjustDuration = (deltaMinutes) => {
    if (isPlaying) return;
    setDuration((prev) => {
      const next = clamp(prev + deltaMinutes, 1, 30);
      // Keep the countdown synchronized when paused.
      setTimeLeft((t) => (t > 0 ? next * 60 : t));
      return next;
    });
  };

  // When the timer naturally completes, send the user to the reflection screen.
  useEffect(() => {
    if (view !== "player") return;
    if (!hasStarted) return;
    if (isPlaying) return;
    if (timeLeft !== 0) return;
    setView("feedback");
  }, [view, hasStarted, isPlaying, timeLeft]);

  const saveFeedback = () => {
    const timestamp = new Date();
    const sessionData = {
      id: Date.now(),
      meditation: selectedMeditation.name,
      duration,
      mood: postMood,
      reflection,
      timestamp: timestamp.toISOString()
    };

    if (reflection.trim()) {
      const entries = JSON.parse(localStorage.getItem("journalEntries") || "[]");
      entries.unshift(sessionData);
      localStorage.setItem("journalEntries", JSON.stringify(entries));
    }

    const moodHistoryEntry = {
      id: `med-${Date.now()}`,
      mood: postMood || "Reflective",
      reason: "Post meditation",
      date: timestamp.toLocaleDateString("en-US"),
      time: timestamp.toLocaleTimeString("en-US", {
        hour: "2-digit",
        minute: "2-digit",
      }),
      timestamp: timestamp.toISOString(),
      source: "meditation",
      context: "post_meditation",
      meditation: selectedMeditation.name,
    };

    const moodHistory = JSON.parse(localStorage.getItem("moodHistoryLocal") || "[]");
    moodHistory.unshift(moodHistoryEntry);
    localStorage.setItem("moodHistoryLocal", JSON.stringify(moodHistory));

    localStorage.setItem("lastMeditation", JSON.stringify(sessionData));
    showPopup({
      title: "NeuralFort",
      message: "Thank you for meditating! Your reflection has been saved.",
      kind: "success",
    });
    setView("selection");
    setSelectedMeditation(null);
    setReflection("");
    setPostMood("");
  };

  if (view === "selection") {
    return (
      <div className="pageBackground meditationDim">
        <div className="meditationBackContainer">
          <div className="meditationHeader">
            <h1>✨ Meditation</h1>
            <p>Find peace in every moment</p>
          </div>
          
          {Object.entries(meditations).map(([category, items]) => (
            <div key={category} className="meditationCategory">
              <div className="categoryHeader">
                <h2 className="categoryTitle">{category}</h2>
              </div>
              <div className="meditationGrid">
                {items.map(med => (
                  <div
                    key={med.id}
                    className="meditationCard"
                    role="button"
                    tabIndex={0}
                    onClick={() => openMeditation(med)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter" || e.key === " ") openMeditation(med);
                    }}
                  >
                    <div className="cardEmoji">{med.emoji}</div>
                    <h3>{med.name}</h3>
                    <div className="cardInstruction">
                      <div className="instructionLabel">What you&apos;ll do:</div>
                      {med.instruction?.map((line, idx) => (
                        <p key={idx}>{line}</p>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}

          <div className="meditationCategory">
            <div className="categoryHeader">
              <h2 className="categoryTitle">Grounding</h2>
            </div>

            <div className="meditationGrid groundingGrid">
              {groundingTechniques.map((tech) => (
                <div key={tech.id} className="meditationCard groundingCard">
                  <h3>{tech.name}</h3>
                  <div className="cardInstruction">
                    <div className="instructionLabel">What you&apos;ll do:</div>
                    {tech.steps.map((line, idx) => (
                      <p key={idx}>{line}</p>
                    ))}
                  </div>
                </div>
              ))}
            </div>

            <p className="groundingGoal">
              Grounding is immediate, simple, and effective during anxiety.
            </p>
          </div>
        </div>
      </div>
    );
  }

  if (view === "player" && selectedMeditation) {
    const displaySeconds = timeLeft === 0 ? duration * 60 : timeLeft;
    const breathCommand =
      breathingPhase === "inhale" ? "Breathe In" : "Breathe Out";
    return (
      <div className="sectionBackdropShell">
        <div className="sectionBackdropBg" aria-hidden="true" />
        <div className="sectionBackdropOverlay" aria-hidden="true" />
        <div className="meditationPlayer sectionActiveSurface">
        <button className="backBtn" onClick={goBackToSelection} type="button">
          ← Back
        </button>

        <div className="playerContent">
          <div className="meditationTitle">
            <h1>{selectedMeditation.emoji} {selectedMeditation.name}</h1>
          </div>

          <div className={`breathingCircle ${breathingPhase}`}>
            <div className="breathingLabel" aria-hidden="true">
              {breathCommand === "Breathe In" ? "Inhale" : "Exhale"}
            </div>
          </div>

          <div className="timerDisplay">
            <h2>{formatTime(displaySeconds)}</h2>
          </div>

          {!isPlaying && (
            <div className="timerAdjustRow" aria-label="Adjust timer">
              <button
                type="button"
                className="timerAdjustBtn"
                onClick={() => adjustDuration(-1)}
                disabled={duration <= 1}
              >
                −
              </button>
              <div className="timerAdjustText">{duration} min</div>
              <button
                type="button"
                className="timerAdjustBtn"
                onClick={() => adjustDuration(1)}
                disabled={duration >= 30}
              >
                +
              </button>
            </div>
          )}

          <div className="playerControls">
            {!isPlaying && timeLeft === 0 ? (
              <button className="startBtn" onClick={startMeditation}>Start</button>
            ) : isPlaying ? (
              <>
                <button className="deleteBtn" onClick={endSession}>Delete</button>
                <button className="pauseBtn" onClick={pauseMeditation}>Pause</button>
              </>
            ) : (
              <>
                <button className="deleteBtn" onClick={endSession}>Delete</button>
                <button className="resumeBtn" onClick={resumeMeditation}>Resume</button>
              </>
            )}
          </div>

          <div className="audioSection">
            <div className="audioHeader">Background music</div>
            <div className="audioMenu" role="menu" aria-label="Background music options">
              {Object.entries(audioSounds).map(([key, label]) => (
                <button
                  key={key}
                  type="button"
                  className={`audioOption ${audioType === key ? "active" : ""}`}
                  onClick={() => setAudioType(key)}
                  aria-pressed={audioType === key}
                >
                  {label}
                </button>
              ))}
            </div>

            <div className="volumeControl">
              <label>🔈 Volume</label>
              <input
                type="range"
                min="0"
                max="100"
                value={volume}
                onChange={e => setVolume(Number(e.target.value))}
                className="volumeSlider"
              />
              <span className="volumeValue">{volume}%</span>
            </div>
          </div>
        </div>
        </div>
      </div>
    );
  }

  if (view === "feedback") {
    return (
      <div className="sectionBackdropShell">
        <div className="sectionBackdropBg" aria-hidden="true" />
        <div className="sectionBackdropOverlay" aria-hidden="true" />
          <div className="feedbackContainer sectionActiveSurface">
            <h1>✨ Session Complete!</h1>
            <p>How are you feeling now?</p>

            <div className="moodFeedback">
              {[
                { value: "Calm", emoji: "😌" },
                { value: "Happy", emoji: "😊" },
                { value: "Neutral", emoji: "😐" },
                { value: "Reflective", emoji: "🤔" }
              ].map(({ value, emoji }) => (
                <button
                  key={value}
                  className={`moodBtn ${postMood === value ? "active" : ""}`}
                  onClick={() => setPostMood(value)}
                >
                  <span className="moodEmoji">{emoji}</span>
                  <span>{value}</span>
                </button>
              ))}
            </div>

            <textarea
              placeholder="Write what's on your mind… ✍️"
              value={reflection}
              onChange={e => setReflection(e.target.value)}
              className="reflectionBox"
              rows="6"
            />

            <button className="saveFeedbackBtn" onClick={saveFeedback}>
              💾 Save & Complete
            </button>
          </div>
      </div>
    );
  }

  return null;
}

export default Meditation;