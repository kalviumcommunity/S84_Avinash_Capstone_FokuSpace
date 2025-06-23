import React, { useState, useEffect, useRef, useMemo } from "react";
import InstalledAppList from "./components/InstalledAppList";
import FocusModeView from "./components/FocusModeView";
import AllowedApps from "./components/AllowedApps";
import StarsBackground from "./components/StarsBackground";
import BlackHoleBackground from "./components/BlackHoleBackground";
import "./App.css";
import "./styles/TimerComponent.css";

function App() {
  // Timer & Focus Mode State
  const [minutes, setMinutes] = useState(25); // default focus time
  const [secondsLeft, setSecondsLeft] = useState(25 * 60);
  const [isRunning, setIsRunning] = useState(false);
  const [isFocusModeActive, setIsFocusModeActive] = useState(false);
  const [exitToken, setExitToken] = useState("");
  // App Management State
  const [allowedApps, setAllowedApps] = useState([]);
  const [installedApps, setInstalledApps] = useState([]);

  const timerRef = useRef(null);
  // Load allowed and installed apps on mount
  useEffect(() => {
    window.electronAPI.getAllowedApps().then(setAllowedApps);
    window.electronAPI.getInstalledApps().then((apps) => {
      console.log("Frontend received apps:", apps);
      setInstalledApps(apps);
    });
  }, []);
  // Focus Mode Status Listener
  useEffect(() => {
    const handleFocusModeStatus = (status) => {
      console.log("Focus mode status received:", status);
      setIsFocusModeActive(status);
    };
    window.electronAPI.receive("focus-mode-status", handleFocusModeStatus);
    return () => {
      if (window.electronAPI.removeListener) {
        window.electronAPI.removeListener(
          "focus-mode-status",
          handleFocusModeStatus
        );
      }
    };
  }, []);

  // Timer Functions
  const formatTime = () => {
    const mins = Math.floor(secondsLeft / 60)
      .toString()
      .padStart(2, "0");
    const secs = (secondsLeft % 60).toString().padStart(2, "0");
    return `${mins}:${secs}`;
  };

  const startTimer = () => {
    if (isRunning) return;
    setSecondsLeft(minutes * 60);
    setIsRunning(true);
    window.electronAPI.send("start-focus-session");
    timerRef.current = setInterval(() => {
      setSecondsLeft((prev) => {
        if (prev <= 1) {
          clearInterval(timerRef.current);
          setIsRunning(false);
          alert("🎉 Focus session complete!");
          window.electronAPI.send("end-focus-session");
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  };

  function generateSecureToken(length = 30) {
    const charset =
      "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*()-_=+[]{}|;:,.<>?";
    let token = "";
    for (let i = 0; i < length; i++) {
      const randomIdx = Math.floor(Math.random() * charset.length);
      token += charset[randomIdx];
    }
    return token;
  }
  // const stopTimer = () => {
  //   clearInterval(timerRef.current);
  //   setIsRunning(false);
  //   window.electronAPI.send("end-focus-session");
  // };

  const handleTimeChange = (e) => {
    const newMinutes = parseInt(e.target.value) || 0;
    setMinutes(newMinutes);
    setSecondsLeft(newMinutes * 60);
  };

  // Focus Mode Controls
  const startFocusSession = () => {
    console.log("🟡 Start Focus Mode Clicked");
    window.electronAPI.send("start-focus-session");
    const token = generateSecureToken();
    setExitToken(token); // Set the token
    startTimer(); // ✅ Start the countdown
  };

  const endFocusSession = () => {
    console.log("Stopeed The fokus Mode");
    window.electronAPI.send("end-focus-session");
  };

  // Allowed/Installed Apps Management
  const handleAllow = (app) => {
    if (!allowedApps.find((a) => a.Name === app.Name)) {
      const updatedAllowed = [...allowedApps, app];
      setAllowedApps(updatedAllowed);
      setInstalledApps(installedApps.filter((a) => a.Name !== app.Name));
      window.electronAPI.setAllowedApps(updatedAllowed);
    }
  };

  const handleRemove = (appName) => {
    const appToRemove = allowedApps.find((a) => a.Name === appName);
    const updatedAllowed = allowedApps.filter((a) => a.Name !== appName);
    setAllowedApps(updatedAllowed);
    setInstalledApps([...installedApps, appToRemove]);
    window.electronAPI.setAllowedApps(updatedAllowed);
  };

  return (
    <>
      <BlackHoleBackground />
      <StarsBackground />
      {isFocusModeActive ? (
        <FocusModeView
          allowedApps={allowedApps}
          onExitFocusMode={() => setIsFocusModeActive(false)}
          secondsLeft={secondsLeft}
          isRunning={isRunning}
          exitToken={exitToken}
        />
      ) : (
        <div className="app-container">
          <div className="left-panel">
            <div className="timer-container">
              <h1 className="timer-title">FokuSpace</h1>
              <p className="timer-label">Set your focus time (minutes):</p>
              <div className="timer-input-wrapper">
                <button
                  className="timer-button"
                  onClick={() => {
                    if (!isRunning) {
                      const newMin = Math.max(minutes - 1, 1);
                      setMinutes(newMin);
                      setSecondsLeft(newMin * 60);
                    }
                  }}
                >
                  -
                </button>

                <input
                  type="number"
                  value={minutes}
                  onChange={handleTimeChange}
                  disabled={isRunning}
                  className="timer-input"
                />

                <button
                  className="timer-button"
                  onClick={() => {
                    if (!isRunning) {
                      const newMin = minutes + 1;
                      setMinutes(newMin);
                      setSecondsLeft(newMin * 60);
                    }
                  }}
                >
                  +
                </button>
              </div>

              <div className="timer-display">{formatTime()}</div>

              <div className="timer-buttons">
                <button onClick={startFocusSession} className="btn start">
                  Start Focus Mode
                </button>
                <button onClick={endFocusSession} className="btn end">
                  End Focus Mode
                </button>
              </div>

              {isFocusModeActive && (
                <div className="focus-status">🔒 Focus Mode Active</div>
              )}
            </div>
            <div className="allowed-apps-section">
              <AllowedApps allowedApps={allowedApps} onRemove={handleRemove} />
            </div>
          </div>
          <div className="installed-apps-panel">
            <InstalledAppList
              apps={installedApps}
              allowedApps={allowedApps}
              onAllow={handleAllow}
              onRemove={handleRemove}
            />
          </div>
        </div>
      )}
    </>
  );
}

export default App;
