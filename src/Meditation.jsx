import React, { useState, useEffect } from "react";
import "./Meditation.css";


function Meditation() {

    const [timeLeft, setTimeLeft] = useState(0);
    const [activeExercise, setActiveExercise] = useState("");
    const [breathingPhase, setBreathingPhase] = useState("inhale");

    const stopTimer = () => {
        setTimeLeft(0);
        setActiveExercise("");
    };

    // Countdown timer
    useEffect(() => {

        if (timeLeft <= 0) return;

        const timer = setTimeout(() => {
            setTimeLeft(timeLeft - 1);
        }, 1000);

        return () => clearTimeout(timer);

    }, [timeLeft]);

    // Breathing animation cycle
    useEffect(() => {

        if (activeExercise !== "Breathing") return;

        const breathCycle = setInterval(() => {

            setBreathingPhase(prev =>
                prev === "inhale" ? "exhale" : "inhale"
            );

        }, 4000); // inhale 4s, exhale 4s

        return () => clearInterval(breathCycle);

    }, [activeExercise]);

    const startExercise = (name, seconds) => {
        setActiveExercise(name);
        setTimeLeft(seconds);
    };

    return (
        <div className="pageBackground">

            <h1>Guided Meditation</h1>

            <div className="exercises">

                <div className="exercise">
                    <h3>🌬 Breathing Meditation</h3>
                    <button onClick={() => startExercise("Breathing", 300)}>
                        Start (5 min)
                    </button>
                </div>

                <div className="exercise">
                    <h3>🧠 Body Scan Relaxation</h3>
                    <button onClick={() => startExercise("Body Scan", 240)}>
                        Start (4 min)
                    </button>
                </div>

                <div className="exercise">
                    <h3>🌿 Mindfulness Focus</h3>
                    <button onClick={() => startExercise("Mindfulness", 180)}>
                        Start (3 min)
                    </button>
                </div>

                <div className="exercise">
                    <h3>🙏 Gratitude Meditation</h3>
                    <button onClick={() => startExercise("Gratitude", 120)}>
                        Start (2 min)
                    </button>
                </div>

            </div>

            {activeExercise && (
                <div className="timer">

                    <h2>
                        {breathingPhase === "inhale" ? "Breathe In" : "Breathe Out"}
                    </h2>

                    {activeExercise === "Breathing" && (
                        <div className={`breathingCircle ${breathingPhase}`}></div>
                    )}

                    <h1>{Math.floor(timeLeft / 60)}:{(timeLeft % 60).toString().padStart(2, '0')}</h1>

                    <button onClick={stopTimer}>
                        Stop Timer
                    </button>

                </div>
            )}

        </div>
    );
}

export default Meditation;