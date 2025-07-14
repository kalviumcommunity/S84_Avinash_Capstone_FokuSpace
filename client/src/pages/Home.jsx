import React, { useEffect, useState } from "react";
import "../styles/Home.css";

const Home = () => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem("token");
    setIsLoggedIn(!!token);

  }, []);

  return (
    <main className="home__container">
      <section className="home__hero">
        <h1 className="home__title">Welcome to FokuSpace</h1>
        <p className="home__subtitle">
          Your one‑stop platform for productivity and collaboration.
        </p>
        <div
          className={`home__download ${
            isLoggedIn ? "" : "home__download--locked"
          }`}
        >
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
            className="home__download-btn"
          >
            {isLoggedIn
              ? "⬇️ Download FokuSpace App"
              : "🔒 Login to Unlock Download"}
          </a>
        </div>
      </section>

      <section className="home__features">
        <h2>✨ Why FokuSpace?</h2>
        <div className="home__features-grid">
          <div className="home__feature-card">
            <h3>🧠 Focus Mode</h3>
            <p>
              Block distractions and stay in the zone with our full‑screen focus
              feature.
            </p>
          </div>
          <div className="home__feature-card">
            <h3>👥 Collaboration</h3>
            <p>
              Share tasks, workspaces, and progress with your team or
              classmates.
            </p>
          </div>
          <div className="home__feature-card">
            <h3>📊 Progress Tracker</h3>
            <p>
              Track daily focus hours and get weekly insights to improve your
              habits.
            </p>
          </div>
        </div>
      </section>

      <section className="home__highlight">
        <h2>🚀 Boost Your Productivity Today</h2>
        <p>
          FokuSpace is designed for students, creators, and professionals who
          want to take control of their time. Try it now and feel the
          difference.
        </p>
        <a href="/register" className="home__cta-btn">
          Join Now
        </a>
      </section>
    </main>
  );
};

export default Home;
