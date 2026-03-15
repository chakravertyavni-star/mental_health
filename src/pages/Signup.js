import React, { useState } from "react";
import "./auth.css";

function Signup() {

  const [username,setUsername] = useState("");
  const [email,setEmail] = useState("");
  const [password,setPassword] = useState("");

  return (

    <div className="auth-container">

      <div className="auth-card">

        <h2>Create Account</h2>

        <input
          type="text"
          placeholder="Username"
          onChange={(e)=>setUsername(e.target.value)}
        />

        <input
          type="email"
          placeholder="Email"
          onChange={(e)=>setEmail(e.target.value)}
        />

        <input
          type="password"
          placeholder="Password"
          onChange={(e)=>setPassword(e.target.value)}
        />

        <button className="auth-btn">
          Sign Up
        </button>

      </div>

    </div>

  );
}

export default Signup;