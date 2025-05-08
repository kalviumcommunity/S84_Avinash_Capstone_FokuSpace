import React from "react";
import { Routes, Route, Link } from "react-router-dom";
import Register from "./components/Register";
import VerifyOtp from "./components/OtpVerification";
import Login from "./components/Login";
import Profile from "./components/Profile";
import { GoogleOAuthProvider, GoogleLogin } from '@react-oauth/google';
import { PrivateRoute } from "./components/PrivateRoute";


function App() {
  return (
    <div className="App">
      <nav>
        <Link to="/">Home</Link> | <Link to="/register">Register</Link> |{" "}
        <Link to="/login">Login</Link> | <Link to="/profile">Profile</Link>
      </nav>
      <GoogleLogin
          onSuccess={credentialResponse => {
            const token = credentialResponse.credential;
            // Send token to backend for verification + login
          }}
          onError={() => {
            console.log('Login Failed');
          }}
        />

      <Routes>
        <Route path="/" element={<h1>Welcome to FokuSpace</h1>} />
        <Route path="/register" element={<Register />} />
        <Route path="/verify-otp" element={<VerifyOtp />} />
        <Route path="/login" element={<Login />} />
        <Route path="/profile" element={
            <PrivateRoute>
              <Profile />
            </PrivateRoute>
          }
        />
      </Routes>
    </div>
  );
}

export default App;
