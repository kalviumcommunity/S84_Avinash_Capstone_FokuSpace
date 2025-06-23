import React, { useState } from "react";
import "../styles/InstalledAppList.css";

const InstalledAppList = ({ apps, allowedApps, onAllow, onRemove }) => {
  const [searchQuery, setSearchQuery] = useState("");

  const filteredApps = apps.filter(
    (app) =>
      app.Name &&
      typeof app.Name === "string" &&
      app.Name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // return (
  //   <div className="installed-apps">
  //     <h2 className="installed-apps-title">Installed Apps</h2>
  //     <input
  //       className="search-input"
  //       value={searchQuery}
  //       onChange={(e) => setSearchQuery(e.target.value)}
  //       type="text"
  //       placeholder="Search Installed apps..."
  //     />
  //     <ul className="installed-apps-list">
  //       {filteredApps.map((app, idx) => (
  //         <li key={app.Name || idx} className="app-item">
  //           <span className="app-name">{app.Name}</span>
  //           <button
  //             className="button-base allow-button"
  //             onClick={() => onAllow(app)}
  //             aria-label={`Allow ${app.Name || "app"} to be used in focus mode`}
  //           >
  //             Allow
  //           </button>
  //         </li>
  //       ))}
  //     </ul>
  //   </div>
  // );

  return (
    <div className="installed-apps">
      <h2 className="installed-apps-title">Installed Apps</h2>
      <input
        className="search-input"
        value={searchQuery}
        onChange={(e) => setSearchQuery(e.target.value)}
        type="text"
        placeholder="Search Installed apps..."
      />
      <ul className="installed-apps-list">
        {filteredApps.map((app, idx) => (
          <li key={app.Name || idx} className="app-item">
            <span className="app-name">{app.Name}</span>
            <button
              className="allow-button"
              onClick={() => onAllow(app)}
              aria-label={`Allow ${app.Name || "app"} to be used in focus mode`}
            >
              Allow
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
};
export default InstalledAppList;
