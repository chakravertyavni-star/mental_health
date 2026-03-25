import React, { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import "./Chatbot.css";

function formatTimeShort(d) {
  try {
    return d.toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" });
  } catch {
    return "";
  }
}

function Chatbot() {
  const navigate = useNavigate();
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState(() => {
    const now = new Date();
    return [
      {
        id: "bot-0",
        role: "bot",
        text: "Hi. Take a breath with me. What's on your mind today?",
        time: formatTimeShort(now),
      },
    ];
  });

  const canSend = useMemo(() => input.trim().length > 0, [input]);

  useEffect(() => {
    const onKey = (e) => {
      if (e.key === "Escape") navigate(-1);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [navigate]);

  const send = () => {
    const text = input.trim();
    if (!text) return;
    setInput("");

    const userTime = formatTimeShort(new Date());
    const userMsg = { id: `u-${Date.now()}`, role: "user", text, time: userTime };
    setMessages((prev) => [...prev, userMsg]);

    // Simple themed response (no backend needed).
    setTimeout(() => {
      const botTime = formatTimeShort(new Date());
      const botText = "Thank you for sharing. I’m here with you. Take your time.";
      setMessages((prev) => [...prev, { id: `b-${Date.now()}`, role: "bot", text: botText, time: botTime }]);
    }, 750);
  };

  return (
    <div className="chatbotPage pageBackground">
      <div className="chatbotTopBar">
        <button type="button" className="chatbotBackBtn" onClick={() => navigate(-1)}>
          ←
        </button>
        <div className="chatbotBrand">
          <div className="chatbotName">NeuralFort</div>
          <div className="chatbotTagline">Take your time. I’m listening</div>
        </div>
      </div>

      <div className="chatbotChatArea" aria-label="Chat messages">
        {messages.map((m) => (
          <div key={m.id} className={`chatBubble ${m.role}`}>
            <div className="chatText">{m.text}</div>
            <div className="chatTime">{m.time}</div>
          </div>
        ))}
      </div>

      <div className="chatbotComposer">
        <input
          className="chatbotInput"
          value={input}
          placeholder="Type what you want to share…"
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") send();
          }}
          aria-label="Chatbot input"
        />
        <button type="button" className="chatbotSendBtn" onClick={send} disabled={!canSend}>
          Send
        </button>
      </div>
    </div>
  );
}

export default Chatbot;

