import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import '../index.css';

const Navbar = () => {
  const navigate = useNavigate();
  const token = localStorage.getItem('token');
  console.log('Navbar rendered, token:', !!token);

  const handleLogout = () => {
    console.log('Logging out');
    localStorage.removeItem('token');
    localStorage.removeItem('pendingVerificationEmail');
    navigate('/login');
  };

  return (
    <nav className="navbar">
      <Link to="/" className="logo">
        FokuSpace
      </Link>
      <ul className="nav-links">
        <li>
          <Link to="/">Home</Link>
        </li>
        {token ? (
          <>
            <li>
              <Link to="/dashboard">Dashboard</Link>
            </li>
            <li>
              <Link to="/profile">Profile</Link>
            </li>
            <li>
              <button onClick={handleLogout}>Logout</button>
            </li>
          </>
        ) : (
          <>
            <li>
              <Link to="/login">Login</Link>
            </li>
            <li>
              <Link to="/register">Register</Link>
            </li>
          </>
        )}
      </ul>
    </nav>
  );
};

export default Navbar;