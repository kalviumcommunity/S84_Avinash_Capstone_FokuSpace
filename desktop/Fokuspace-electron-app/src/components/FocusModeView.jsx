import React, { useEffect, useState } from "react";
import "../styles/FocusModeView.css";

const FocusModeView = ({
  allowedApps,
  onExitFocusMode,
  secondsLeft,
  exitToken,
}) => {
  const [inputValue, setInputValue] = useState("");
  const [showExitToken, setShowExitToken] = useState(false);

  const formatTime = () => {
    const mins = Math.floor(secondsLeft / 60)
      .toString()
      .padStart(2, "0");
    const secs = (secondsLeft % 60).toString().padStart(2, "0");
    return `${mins}:${secs}`;
  };

  useEffect(() => {
    const handleWarning = () => {
      alert(`🚫 You cannot exit during focus mode! Dumb!`);
    };
    window.electronAPI.receive("show-exit-warning", handleWarning);
    return () => {
      if (window.electronAPI.removeListener) {
        window.electronAPI.removeListener("show-exit-warning", handleWarning);
      }
    };
  }, []);

  useEffect(() => {
    const blockReload = (e) => {
      if ((e.ctrlKey && e.key === "r") || e.key === "f5" || e.keyCode === 116) {
        e.preventDefault();
      }
    };
    window.addEventListener("keydown", blockReload);

    window.electronAPI.blockClose();

    return () => {
      window.removeEventListener("keydown", blockReload);
      window.electronAPI.unblockClose();
    };
  }, []);

  //   const getIconSrc = (app) => {
  //     const isValidPath = (p) =>
  //       typeof p === "string" &&
  //       /\.(ico|png|jpg|jpeg)$/i.test(p.trim()) &&
  //       !/\.exe$/i.test(p) &&
  //       !p.includes("undefined");

  //     if (isValidPath(app.DisplayIcon)) {
  //       return `file:///${app.DisplayIcon.trim().replace(/\\/g, "/")}`;
  //     }
  //     if (isValidPath(app.Path)) {
  //       return `file:///${app.Path.trim().replace(/\\/g, "/")}`;
  //     }

  //     return "icon.ico";
  //   };

  const handleTokenInput = (e) => {
    const pasted = e.clipboardData?.getData("text");
    if (pasted) {
      e.preventDefault();
    }
  };

  const handleForceExit = () => {
    if (inputValue === exitToken) {
      alert(`Exiting Early using Token.`);
      onExitFocusMode();
    } else {
      alert(`❌ Incorrect token. Type it carefully.`);
    }
  };

  return (
    <div className="focus-mode-container">
      <aside className="focus-panel">
        <h1>🔒 Focus Mode Active</h1>
        <h2>Time Remaining: {formatTime()}</h2>
        <p>Access only allowed apps during this session.</p>
        <h2>🧭 Allowed Apps</h2>
        <ul>
          {allowedApps.map((app, idx) => (
            <li key={idx}>
              <button onClick={() => window.electronAPI.launchApp(app.Path)}>
                {app.Name}
              </button>
            </li>
          ))}
        </ul>
      </aside>

      <div className="exit-section">
        {secondsLeft > 0 ? (
          <>
            {!showExitToken ? (
              <>
                <p>You are in Fokus Mode. Time left: {formatTime()}</p>
                <button onClick={() => setShowExitToken(true)}>
                  🚪 Force Exit
                </button>
              </>
            ) : (
              <>
                <h3>Type the token to confirm exit:</h3>
                <h4>
                  Think twice before exiting. Is something fun more important
                  than your goals?
                </h4>
                <pre>{exitToken}</pre>
                <input
                  type="text"
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                  onPaste={(e) => e.preventDefault()}
                  placeholder="Enter the token manually"
                />
                <button onClick={handleForceExit}>Confirm Exit</button>
              </>
            )}
          </>
        ) : (
          <button onClick={onExitFocusMode}>✅ Time Completed — Exit</button>
        )}
      </div>
    </div>
  );
};
export default FocusModeView;
