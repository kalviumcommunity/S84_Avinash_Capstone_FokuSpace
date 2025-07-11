import React, { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { login, googleLogin } from "../../api";
// 👇 Import the new gradient/block‑cube styles
import "../../styles/Login.scss";
import EyeSwitch from "../Creative Icons/EyeSwitch";

const Login = () => {
  const [formData, setFormData] = useState({ email: "", password: "" });
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  const handleChange = (e) =>
    setFormData({ ...formData, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);

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
      const response = await login(formData);
      localStorage.setItem("token", response.token);
      navigate("/profile");
    } catch (err) {
      if (err === "Please verify your account before logging in.") {
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
    <div className="login">
      {/* background shapes */}
      <div className="login__background">
        <div className="login__shape login__shape--one" />
        <div className="login__shape login__shape--two" />
      </div>

      <form className="login__form" onSubmit={handleSubmit}>
        <h1 className="login__title">Sign In</h1>

        {error && <p className="login__error">{error}</p>}
        {location.state?.error && (
          <p className="login__error">{location.state.error}</p>
        )}

        {/* Email */}
        <div className="login__control">
          <input
            className="login__input"
            placeholder="Email"
            type="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            disabled={isLoading}
          />
        </div>

        {/* Password */}
        <div className="login__control login__control--password">
          <div className="login__input-wrapper">
            <input
              className="login__input"
              placeholder="Password"
              type={showPassword ? "text" : "password"}
              name="password"
              value={formData.password}
              onChange={handleChange}
              disabled={isLoading}
            />
            <div className="eye-switch-wrapper">
              <EyeSwitch
                isOn={showPassword}
                onToggle={setShowPassword}
                size={50}
              />
            </div>
          </div>
        </div>

        {/* Buttons */}
        <button type="submit" className="login__button" disabled={isLoading}>
          {isLoading ? "Logging in…" : "Log In"}
        </button>

        <button
          type="button"
          onClick={googleLogin}
          className="login__button login__button--google"
          disabled={isLoading}
        >
          Login with Google
        </button>
        <br />
        {/* Links */}
        <p className="login__link">
          Forgot password? <a href="/reset-password-request">Reset it</a>
        </p>
        <p className="login__link">
          Don’t have an account? <a href="/register">Register here</a>
        </p>
        <br />

        <p>
          It is Still in working phase. If you are facing "An error occurred"
          try reloading the page or switch to incognito mode.
          <br />
          The Login with Google button is not functional yet.
          <br />
        </p>
      </form>
    </div>
  );
};

export default Login;
