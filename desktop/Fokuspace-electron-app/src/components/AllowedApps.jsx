import React from "react";
import "../styles/AllowedApps.css";

const AllowedApps = ({ allowedApps, onRemove }) => {
  // return (
  //   <div>
  //     <h2>Allowed Apps</h2>
  //     <ul>
  //       {allowedApps.map((app, idx) => (
  //         <li
  //           key={idx}
  //           style={{
  //             display: "flex",
  //             alignItems: "center",
  //             gap: "10px",
  //             marginBottom: "10px",
  //             backgroundColor: "#111",
  //             padding: "8px",
  //             borderRadius: "8px",
  //             maxWidth: "400px",
  //           }}
  //         >
  //           <img
  //             width="32"
  //             height="32"
  //             style={{
  //               objectFit: "contain",
  //               borderRadius: "4px",
  //             }}
  //             src={getIconSrc(app)}
  //             alt={app.Name || "App Icon"}
  //             onError={(e) => {
  //               e.target.onerror = null;
  //               e.target.src = "icon.ico";
  //             }}
  //           />
  //           <span style={{ flex: 1 }}>{app.Name}</span>
  //           <button onClick={() => onRemove(app.Name)}> ✖ </button>
  //         </li>
  //       ))}
  //     </ul>
  //   </div>
  // );

  return (
    <div className="allowed-apps">
      <h2 className="allowed-apps-title">Allowed Apps</h2>
      <ul className="allowed-apps-list">
        {allowedApps.map((app, idx) => (
          <li key={idx} className="app-item">
            <span className="app-name">{app.Name}</span>
            <button
              className="remove-button"
              onClick={() => onRemove(app.Name)}
            >
              ✖
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
};
export default AllowedApps;
