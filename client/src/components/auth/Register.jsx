import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { register } from "../../api";
import "../../styles/auth css/Register.scss";
import EyeSwitch from "../Creative Icons/EyeSwitch";

const Register = () => {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    age: "",
    profession: "",
  });

  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const navigate = useNavigate();

  const handleChange = (e) =>
    setFormData({ ...formData, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);

    const { name, email, password, age, profession } = formData;

    if (!name || !email || !password || !age || !profession) {
      setError("Please fill in all fields");
      setIsLoading(false);
      return;
    }

    if (!/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[\W_]).{8,}$/.test(password)) {
      setError(
        "Password must be at least 8 characters long and include uppercase, lowercase, number, and special character."
      );
      setIsLoading(false);
      return;
    }

    if (age < 18) {
      setError("Age must be at least 18");
      setIsLoading(false);
      return;
    }

    try {
      await register(formData);
      localStorage.setItem("pendingVerificationEmail", email);
      navigate("/verify-otp");
    } catch (err) {
      setError(err || "Registration failed");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="register">
      <div className="register__background">
        <div className="register__shape register__shape--one"></div>
        <div className="register__shape register__shape--two"></div>
      </div>

      <form className="register__form" onSubmit={handleSubmit}>
        <h1 className="register__title">Register</h1>

        {error && <p className="register__error">{error}</p>}

        {/* Name */}
        <div className="register__control">
          <input
            className="register__input"
            placeholder="Full Name"
            type="text"
            name="name"
            value={formData.name}
            onChange={handleChange}
            disabled={isLoading}
          />
        </div>

        {/* Email */}
        <div className="register__control">
          <input
            className="register__input"
            placeholder="Email"
            type="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            disabled={isLoading}
          />
        </div>

        {/* Password with Eye Toggle */}
        <div className="register__control register__control--password">
          <div className="register__input-wrapper">
            <input
              className="register__input"
              placeholder="Password"
              type={showPassword ? "text" : "password"}
              name="password"
              value={formData.password}
              onChange={handleChange}
              disabled={isLoading}
            />
            <div
              className="register__eye-toggle"
              onClick={() => setShowPassword(!showPassword)}
              title={showPassword ? "Hide Password" : "Show Password"}
            >
              <EyeSwitch
                isOn={showPassword}
                onToggle={() => setShowPassword(!showPassword)}
                size={48}
              />
            </div>
          </div>
        </div>

        {/* Age */}
        <div className="register__control">
          <input
            className="register__input"
            placeholder="Age"
            type="number"
            name="age"
            value={formData.age}
            onChange={handleChange}
            min="18"
            disabled={isLoading}
          />
        </div>

        {/* Profession */}
        <div className="register__control">
          <input
            className="register__input"
            placeholder="Profession"
            type="text"
            name="profession"
            value={formData.profession}
            onChange={handleChange}
            disabled={isLoading}
          />
        </div>

        {/* Submit */}
        <button className="register__button" type="submit" disabled={isLoading}>
          {isLoading ? "Registering..." : "Register"}
        </button>

        <p className="register__link">
          Already have an account? <a href="/login">Login here</a>
        </p>
      </form>
    </div>
  );
};

export default Register;
