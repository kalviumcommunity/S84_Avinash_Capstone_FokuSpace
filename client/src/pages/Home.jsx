import React from 'react';
import '../index.css';

const Home = () => {
  console.log('Rendering Home page');
  return (
    <div className="home">
      <h1>Welcome to FokuSpace</h1>
      <p>Your one-stop platform for productivity and collaboration.</p>
      <a href="/register" className="btn">
        Get Started
      </a>
    </div>
  );
};

export default Home;