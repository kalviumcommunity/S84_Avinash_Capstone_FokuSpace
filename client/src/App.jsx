import React from "react";
import { Routes, Route, Link } from "react-router-dom";
import Login from "./components/Login";
import Register from "./components/Register";

// import { GoogleOAuthProvider, GoogleLogin } from "@react-oauth/google";

function App() {
  return (
    <div>
      <Routes>
        <Route path="/" element={<h1>Welcome to FokuSpace</h1>} />
        <Route path="/register" element={<Register />} />
        <Route path="/login" element={<Login />} />
      </Routes>
    </div>
  );
}

export default App;
