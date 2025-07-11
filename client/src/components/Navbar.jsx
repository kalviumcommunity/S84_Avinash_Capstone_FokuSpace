import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import "../styles/Navbar.scss"          // ← new scoped styles

const Navbar = () => {
  const [open, setOpen] = useState(false);  // mobile drawer
  const navigate = useNavigate();
  const token = localStorage.getItem("token");

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("pendingVerificationEmail");
    navigate("/login");
  };

  return (
    <header className="navbar">
      <Link to="/" className="navbar__logo">
        Foku<span>Space</span>
      </Link>

      {/* Hamburger (mobile) */}
      <button
        className={`navbar__toggle ${open ? "is-active" : ""}`}
        onClick={() => setOpen(!open)}
        aria-label="Menu"
      >
        <span />
        <span />
        <span />
      </button>

      {/* Links */}
      <nav className={`navbar__menu ${open ? "is-open" : ""}`}>
        <Link to="/" onClick={() => setOpen(false)}>
          Home
        </Link>

        {token ? (
          <>
            <Link to="/dashboard" onClick={() => setOpen(false)}>
              Dashboard
            </Link>
            <Link to="/profile" onClick={() => setOpen(false)}>
              Profile
            </Link>
            <button onClick={handleLogout}>Logout</button>
          </>
        ) : (
          <>
            <Link to="/login" onClick={() => setOpen(false)}>
              Login
            </Link>
            <Link to="/register" onClick={() => setOpen(false)}>
              Register
            </Link>
          </>
        )}
      </nav>
    </header>
  );
};

export default Navbar;
