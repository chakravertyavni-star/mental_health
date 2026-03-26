import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import "./auth.css";
import { showPopup } from "../popup/showPopup";

function Signup() {
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const navigate = useNavigate();

  const handleSignup = async () => {
    if (!username || !email || !password) {
      showPopup({ title: "NeuralFort", message: "Please fill all fields.", kind: "error" });
      return;
    }

    const usersRaw = localStorage.getItem("neuralfort_users_v1");
    const users = usersRaw ? JSON.parse(usersRaw) : {};

    const normalizedEmail = String(email).toLowerCase().trim();
    const existing = users[normalizedEmail];
    if (existing) {
      showPopup({ title: "NeuralFort", message: "Email already in use.", kind: "error" });
      return;
    }

    const nextUser = {
      username: String(username).trim(),
      email: normalizedEmail,
      password,
    };

    users[normalizedEmail] = nextUser;
    localStorage.setItem("neuralfort_users_v1", JSON.stringify(users));
    localStorage.setItem("username", nextUser.username);
    navigate("/dashboard");
  };

  return (
    <div className="auth-container">
      <div className="auth-card">
        <h2>NeuralFort</h2>
        <input type="text" placeholder="Username" onChange={(e) => setUsername(e.target.value)} />
        <input type="email" placeholder="Email" onChange={(e) => setEmail(e.target.value)} />
        <input type="password" placeholder="Password" onChange={(e) => setPassword(e.target.value)} />
        <button className="auth-btn" onClick={handleSignup}>Sign Up</button>
      </div>
    </div>
  );
}

export default Signup;