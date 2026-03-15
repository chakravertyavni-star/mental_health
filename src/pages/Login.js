import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import "./auth.css";

function Login() {

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const navigate = useNavigate();

    const handleLogin = async () => {

    if (!email || !password) {
        alert("Please fill all fields");
        return;
    }

    const res = await fetch("http://localhost:5000/api/auth/login", {
        method: "POST",
        headers: {
        "Content-Type": "application/json"
        },
        body: JSON.stringify({
        email,
        password
        })
    });

    const data = await res.json();

    if (res.ok) {
        localStorage.setItem("username", data.username);
        navigate("/dashboard");
    }
    else {
        alert(data.message);
    }
    };

  return (

    <div className="auth-container">

      <div className="auth-card">

        <h2>Mental Health Portal</h2>

        <input
          type="email"
          placeholder="Email"
          onChange={(e) => setEmail(e.target.value)}
        />

        <input
          type="password"
          placeholder="Password"
          onChange={(e) => setPassword(e.target.value)}
        />

        <button className="auth-btn" onClick={handleLogin}>
          Login
        </button>

        <p>
          Don't have an account? 
          <span onClick={() => navigate("/signup")}> Sign Up</span>
        </p>

      </div>

    </div>

  );
}

export default Login;