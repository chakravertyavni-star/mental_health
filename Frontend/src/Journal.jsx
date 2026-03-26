import React, { useEffect, useMemo, useRef, useState } from "react";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import "./Journal.css";

function Journal() {
  const navigate = useNavigate();
  const locationObj = useLocation();
  const { date } = useParams();

  const STORAGE_KEY = "dailyJournal_v1";
  const touchStartXRef = useRef(null);
  const backDestinationRef = useRef(locationObj.state?.from || "/dashboard");

  const isValidDateKey = (value) =>
    typeof value === "string" && /^\d{4}-\d{2}-\d{2}$/.test(value);

  const toDateKey = (d) => {
    const year = d.getFullYear();
    const month = `${d.getMonth() + 1}`.padStart(2, "0");
    const day = `${d.getDate()}`.padStart(2, "0");
    return `${year}-${month}-${day}`;
  };

  const parseDateKey = (key) => {
    const [y, m, d] = key.split("-").map(Number);
    return new Date(y, m - 1, d);
  };

  const addDays = (key, delta) => {
    const d = parseDateKey(key);
    d.setDate(d.getDate() + delta);
    return toDateKey(d);
  };

  const formatDateLong = (key) => {
    const d = parseDateKey(key);
    return d.toLocaleDateString("en-US", {
      weekday: "long",
      month: "long",
      day: "numeric",
      year: "numeric",
    });
  };

  const [todayKey, setTodayKey] = useState(() => toDateKey(new Date()));
  const prevTodayKeyRef = useRef(todayKey);
  const selectedDateKey = isValidDateKey(date) ? date : todayKey;

  const [journalMap, setJournalMap] = useState({});
  const journalMapRef = useRef({});
  const [text, setText] = useState("");
  const [hasLoaded, setHasLoaded] = useState(false);
  const textRef = useRef(text);
  const autosaveTimerRef = useRef(null);
  const textAreaRef = useRef(null);

  // Load journal once.
  useEffect(() => {
    try {
      const parsed = JSON.parse(localStorage.getItem(STORAGE_KEY) || "{}");
      journalMapRef.current = parsed;
      setJournalMap(parsed);
    } catch {
      journalMapRef.current = {};
      setJournalMap({});
    } finally {
      setHasLoaded(true);
    }
  }, []);

  // Ensure the current day has a dedicated blank page.
  useEffect(() => {
    if (!hasLoaded) return;
    const currentMap = journalMapRef.current;
    if (!Object.prototype.hasOwnProperty.call(currentMap, selectedDateKey)) {
      const next = { ...currentMap, [selectedDateKey]: "" };
      journalMapRef.current = next;
      setJournalMap(next);
      localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
    }
  }, [hasLoaded, selectedDateKey]);

  // When a new day starts, create a new blank page for it.
  useEffect(() => {
    if (!hasLoaded) return;
    const interval = setInterval(() => {
      const nextToday = toDateKey(new Date());
      if (nextToday === todayKey) return;

      // Ensure the new date exists in storage (even if user stays on the previous day).
      const currentMap = journalMapRef.current;
      if (!Object.prototype.hasOwnProperty.call(currentMap, nextToday)) {
        const next = { ...currentMap, [nextToday]: "" };
        journalMapRef.current = next;
        setJournalMap(next);
        localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
      }

      prevTodayKeyRef.current = todayKey;
      setTodayKey(nextToday);
    }, 30000);

    return () => clearInterval(interval);
  }, [hasLoaded, todayKey]);

  // If the user is viewing "Today", switch automatically at midnight.
  useEffect(() => {
    if (!hasLoaded) return;
    if (selectedDateKey !== prevTodayKeyRef.current) return;
    navigate(`/journal/${todayKey}`);
  }, [hasLoaded, navigate, selectedDateKey, todayKey]);

  // Keep local editor state in sync with selected date.
  useEffect(() => {
    if (!hasLoaded) return;
    const current = journalMapRef.current[selectedDateKey] ?? "";
    setText(current);
  }, [hasLoaded, selectedDateKey]);

  // Auto-save continuously (debounced).
  useEffect(() => {
    if (!hasLoaded) return;
    textRef.current = text;
    if (autosaveTimerRef.current) clearTimeout(autosaveTimerRef.current);

    autosaveTimerRef.current = setTimeout(() => {
      const currentMap = journalMapRef.current;
      const next = { ...currentMap, [selectedDateKey]: textRef.current };
      journalMapRef.current = next;
      setJournalMap(next);
      localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
    }, 450);

    return () => {
      if (autosaveTimerRef.current) clearTimeout(autosaveTimerRef.current);
    };
  }, [text, selectedDateKey, hasLoaded]);

  // Save immediately if user leaves the page.
  useEffect(() => {
    const onBeforeUnload = () => {
      try {
        const next = {
          ...journalMapRef.current,
          [selectedDateKey]: textRef.current,
        };
        journalMapRef.current = next;
        localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
      } catch {
        // ignore
      }
    };
    window.addEventListener("beforeunload", onBeforeUnload);
    return () => window.removeEventListener("beforeunload", onBeforeUnload);
  }, [selectedDateKey]);

  // Auto-resize with a cap so the page doesn't keep growing.
  useEffect(() => {
    const el = textAreaRef.current;
    if (!el) return;
    // Cap growth so the page doesn't elongate; textarea scroll handles overflow instead.
    const maxPx = Math.round(window.innerHeight * 0.65);
    el.style.height = "auto";
    const nextPx = Math.min(el.scrollHeight, maxPx);
    el.style.height = `${nextPx}px`;
  }, [text, selectedDateKey]);

  const sortedDateKeys = useMemo(() => {
    const keys = Object.keys(journalMap || {});
    // Newest first; date keys sort lexicographically as ISO (YYYY-MM-DD).
    return keys.sort((a, b) => b.localeCompare(a));
  }, [journalMap]);

  const gotoDay = (delta) => {
    const nextKey = addDays(selectedDateKey, delta);
    navigate(`/journal/${nextKey}`);
  };

  // Swipe navigation (touch devices).
  const onTouchStart = (e) => {
    touchStartXRef.current = e.touches?.[0]?.clientX ?? null;
  };
  const onTouchEnd = (e) => {
    const startX = touchStartXRef.current;
    touchStartXRef.current = null;
    if (startX === null) return;
    const endX = e.changedTouches?.[0]?.clientX ?? null;
    if (endX === null) return;

    const dx = endX - startX;
    if (Math.abs(dx) < 60) return;

    // Swipe left -> previous day (older). Swipe right -> next day.
    if (dx < 0) gotoDay(-1);
    else gotoDay(1);
  };

  // If someone goes to /journal, redirect to an explicit date route.
  useEffect(() => {
    if (isValidDateKey(date)) return;
    navigate(`/journal/${selectedDateKey}`, { replace: true });
  }, [date, navigate, selectedDateKey]);

  return (
    <div className="journalDailyRoot">
      <div className="journalTopBar">
        <button
          type="button"
          className="journalBackBtn"
          onClick={() => navigate(backDestinationRef.current)}
          aria-label="Back to previous page"
        >
          ←
        </button>

        <div className="journalNavButtons">
          <button
            type="button"
            className="journalNavBtn"
            onClick={() => gotoDay(-1)}
            aria-label="Previous day"
          >
            ←
          </button>
          <button
            type="button"
            className="journalNavBtn"
            onClick={() => gotoDay(1)}
            aria-label="Next day"
          >
            →
          </button>
        </div>

        <div className="journalDateBlock">
          <div className="journalDateLine">
            <span className="journalTodayLabel">
              {selectedDateKey === todayKey ? "Today" : ""}
            </span>
            <span className="journalDate">{formatDateLong(selectedDateKey)}</span>
          </div>
        </div>

        <div className="journalNavButtons journalJumpSpacer" />
      </div>

      <div className="journalGrid">
        <aside className="historyPanel" aria-label="Journal history">
          <div className="historyHeader">
            <div className="historyTitle">History</div>

            <label className="historyJumpLabel">
              Jump to
              <input
                type="date"
                className="historyJumpInput"
                value={selectedDateKey}
                onChange={(e) => navigate(`/journal/${e.target.value}`)}
              />
            </label>
          </div>

          <div className="historyList">
            {sortedDateKeys.length === 0 ? (
              <div className="historyEmpty">No entries yet</div>
            ) : (
              sortedDateKeys.map((key) => {
                const preview = (journalMap[key] || "").trim();
                const previewText = preview
                  ? preview.slice(0, 72) + (preview.length > 72 ? "…" : "")
                  : "Blank page";
                const isActive = key === selectedDateKey;
                const isToday = key === todayKey;
                return (
                  <div
                    key={key}
                    className={`historyItem ${isActive ? "active" : ""}`}
                    role="button"
                    tabIndex={0}
                    onClick={() => navigate(`/journal/${key}`)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter" || e.key === " ") navigate(`/journal/${key}`);
                    }}
                    aria-label={`Open journal for ${key}`}
                  >
                    <div className="historyItemTop">
                      <div className="historyItemDate">{key}</div>
                      {isToday && <div className="historyTodayTag">Today</div>}
                    </div>
                    <div className="historyItemPreview">{previewText}</div>
                  </div>
                );
              })
            )}
          </div>
        </aside>

        <main
          className="journalPage"
          key={selectedDateKey}
          onTouchStart={onTouchStart}
          onTouchEnd={onTouchEnd}
        >
          <textarea
            ref={textAreaRef}
            className="journalTextarea"
            placeholder="Write anything… no one will judge you."
            value={text}
            onChange={(e) => setText(e.target.value)}
            spellCheck={true}
          />
        </main>
      </div>
    </div>
  );
}

export default Journal;
