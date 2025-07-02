import React, { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { login, googleLogin } from "../api";
import "../index.css";
import { FaEye, FaEyeSlash } from "react-icons/fa";

const Login = () => {
  const [formData, setFormData] = useState({ email: "", password: "" });
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false); // 👁️ toggle state
  const navigate = useNavigate();
  const location = useLocation();

  const handleChange = (e) =>
    setFormData({ ...formData, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);

    console.log("Login attempt:", formData.email);
    if (!formData.email || !formData.password) {
      setError("Please fill in all fields");
      setIsLoading(false);
      return;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      setError("Please enter a valid email address");
      setIsLoading(false);
      return;
    }

    try {
      console.log("🌿 FINAL LOGIN PAYLOAD:", formData);
      const response = await login(formData);
      console.log("Login successful:", formData.email);
      localStorage.setItem("token", response.token);
      navigate("/profile");
    } catch (err) {
      console.error("Login error:", err);
      if (err === "Please verify your account before logging in.") {
        console.log("Redirecting to verify-otp:", formData.email);
        localStorage.setItem("pendingVerificationEmail", formData.email);
        navigate("/verify-otp");
      } else {
        setError(err || "Login failed");
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="login-container">
      <h2>Login</h2>
      {error && <p className="error-message">{error}</p>}
      {location.state?.error && (
        <p className="error-message">{location.state.error}</p>
      )}
      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label>Email:</label>
          <input
            type="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            required
            disabled={isLoading}
          />
        </div>
        <div className="form-group password-group">
          <label>Password:</label>
          <input
            type={showPassword ? "text" : "password"}
            name="password"
            value={formData.password}
            onChange={handleChange}
            required
            disabled={isLoading}
          />
          <span
            className="password-toggle-icon"
            onClick={() => setShowPassword(!showPassword)}
          >
            {showPassword ? <FaEyeSlash /> : <FaEye />}
          </span>
        </div>
        <button type="submit" className="Login__button" disabled={isLoading}>
          {isLoading ? "Logging in..." : "Login"}
        </button>
      </form>
      <button onClick={googleLogin} className="google-btn" disabled={isLoading}>
        Login with Google
      </button>
      <p className="register-link">
        Forgot password? <a href="/reset-password-request">Reset it</a>
      </p>
      <p className="register-link">
        Don't have an account? <a href="/register">Register here</a>
      </p>
    </div>
  );
};

export default Login;
