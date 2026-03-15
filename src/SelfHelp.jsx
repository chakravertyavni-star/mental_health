import React from "react";
import "./SelfHelp.css";
import { useNavigate } from "react-router-dom";

function SelfHelp() {
    const navigate = useNavigate();

    return (
        <div className="pageBackground">

            <h1>Self Help Techniques</h1>

            <div className="helpGrid">

                <div className="helpCard">
                    <h3>🌱 Grounding Exercise</h3>
                    <p>
                        Look around and name:
                        <br />5 things you see
                        <br />4 things you feel
                        <br />3 things you hear
                    </p>
                </div>

                <div className="helpCard">
                    <h3>⚡ Quick Stress Reset</h3>
                    <p>Start a quick breathing meditation to calm down.</p>

                    <button onClick={() => navigate("/meditation")}>
                        Start Now
                    </button>
                </div>

                <div className="helpCard">
                    <h3>🌞 Positive Thinking</h3>
                    <p>
                        Replace negative thoughts with:
                        <br />“I am capable”
                        <br />“I will get through this”
                    </p>
                </div>

                <div className="helpCard">
                    <h3>🌙 Sleep Relaxation</h3>
                    <p>
                        Relax each muscle group
                        starting from your toes
                        and moving slowly upward.
                    </p>
                </div>

            </div>

        </div>
    );
}

export default SelfHelp;