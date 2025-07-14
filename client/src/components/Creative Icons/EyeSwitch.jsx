// src/components/Creative Icons/EyeSwitch.jsx
import React from "react";
import "../../styles/Creative-css/EyeSwitch.scss";

const EyeSwitch = ({ isOn, onToggle, size = 46 }) => {
  return (
    <div className="power-switch" style={{ width: size, height: size }}>
      <input
        type="checkbox"
        checked={isOn}
        onChange={() => onToggle(!isOn)}
      />
      <div className="button">
        <svg className="power-off" viewBox="0 0 150 150">
          <use xlinkHref="#line" className="line" />
          <use xlinkHref="#circle" className="circle" />
        </svg>
        <svg className="power-on" viewBox="0 0 150 150">
          <use xlinkHref="#line" className="line" />
          <use xlinkHref="#circle" className="circle" />
        </svg>
      </div>

      {/* SVG symbols */}
      <svg xmlns="http://www.w3.org/2000/svg" style={{ display: "none" }}>
        <symbol id="line" viewBox="0 0 150 150">
          <line x1="75" y1="34" x2="75" y2="58" />
        </symbol>
        <symbol id="circle" viewBox="0 0 150 150">
          <circle cx="75" cy="80" r="35" />
        </symbol>
      </svg>
    </div>
  );
};

export default EyeSwitch;
