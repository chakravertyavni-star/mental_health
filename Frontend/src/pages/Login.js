import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import "./auth.css";
import { showPopup } from "../popup/showPopup";

function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    const usersRaw = localStorage.getItem("neuralfort_users_v1");
    const users = usersRaw ? JSON.parse(usersRaw) : {};
    const normalizedEmail = "harshit@gmail.com";

    if (!users[normalizedEmail]) {
      users[normalizedEmail] = {
        username: "Harshit",
        email: normalizedEmail,
        password: "123456",
      };
      localStorage.setItem("neuralfort_users_v1", JSON.stringify(users));
    }
  }, []);

  const handleLogin = async () => {
    if (!email || !password) {
      showPopup({ title: "NeuralFort", message: "Please fill all fields.", kind: "error" });
      return;
    }

    const usersRaw = localStorage.getItem("neuralfort_users_v1");
    const users = usersRaw ? JSON.parse(usersRaw) : {};
    const normalizedEmail = String(email).toLowerCase().trim();
    const user = users[normalizedEmail];

    if (!user || user.password !== password) {
      showPopup({ title: "NeuralFort", message: "Login failed. Check your details.", kind: "error" });
      return;
    }

    localStorage.setItem("username", user.username);
    navigate("/dashboard");
  };

  return (
    <div className="auth-container">
      <div className="auth-card">
        <h2>NeuralFort</h2>
        <input type="email" placeholder="Email" onChange={(e) => setEmail(e.target.value)} />
        <input type="password" placeholder="Password" onChange={(e) => setPassword(e.target.value)} />
        <button className="auth-btn" onClick={handleLogin}>Login</button>
        <p>Don't have an account? <span onClick={() => navigate("/signup")}> Sign Up</span></p>
      </div>
    </div>
  );
}

export default Login;