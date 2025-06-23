import React, { useEffect, useState } from "react";
import "../styles/Home.css";

const Home = () => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  useEffect(() => {
    const token = localStorage.getItem("token"); // adjust if you use a different key
    setIsLoggedIn(!!token);
  }, []);

  console.log("Rendering Home page");
  return (
    <div className="home">
      <h1>Welcome to FokuSpace</h1>
      <p>Your one-stop platform for productivity and collaboration.</p>
      <a href="/register" className="btn">
        Get Started
      </a>
      <div className={`download-section ${isLoggedIn ? "" : "locked"}`}>
        <a
          href={
            isLoggedIn
              ? "https://github.com/kalviumcommunity/S84_Avinash_Capstone_FokuSpace/releases/download/v1.0.0/FokuSpace.Setup.1.0.0.exe"
              : "#"
          }
          onClick={(e) => {
            if (!isLoggedIn) {
              e.preventDefault();
              alert("🔒 Please log in to download the app.");
            }
          }}
          className="download-btn"
        >
          {isLoggedIn
            ? "⬇️ Download FokuSpace App"
            : "🔒 Login to Unlock Download"}
        </a>
      </div>
    </div>
  );
};

export default Home;
