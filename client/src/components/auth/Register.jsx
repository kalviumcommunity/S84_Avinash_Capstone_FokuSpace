import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { register } from "../../api";
import '../../styles/Register.scss'

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
  const navigate = useNavigate();

  const handleChange = (e) =>
    setFormData({ ...formData, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);

    if (
      !formData.name ||
      !formData.email ||
      !formData.password ||
      !formData.age ||
      !formData.profession
    ) {
      setError("Please fill in all fields");
      setIsLoading(false);
      return;
    }
    if (
      !/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[\W_]).{8,}$/.test(
        formData.password
      )
    ) {
      setError(
        "Password must be at least 8 characters long and include uppercase, lowercase, number, and special character."
      );
      setIsLoading(false);
      return;
    }
    if (formData.age < 18) {
      setError("Age must be at least 18");
      setIsLoading(false);
      return;
    }

    try {
      await register(formData);
      localStorage.setItem("pendingVerificationEmail", formData.email);
      navigate("/verify-otp");
    } catch (err) {
      setError(err || "Registration failed");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="login-page">
      <form className="form-wrap" onSubmit={handleSubmit}>
        <h1>Register</h1>

        {error && <p className="error-message">{error}</p>}

        {/* Name */}
        <div className="control block-cube block-input">
          <input
            placeholder="Full Name"
            type="text"
            name="name"
            value={formData.name}
            onChange={handleChange}
            disabled={isLoading}
          />
          <div className="bg-top"><div className="bg-inner" /></div>
          <div className="bg-right"><div className="bg-inner" /></div>
          <div className="bg"><div className="bg-inner" /></div>
        </div>

        {/* Email */}
        <div className="control block-cube block-input">
          <input
            placeholder="Email"
            type="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            disabled={isLoading}
          />
          <div className="bg-top"><div className="bg-inner" /></div>
          <div className="bg-right"><div className="bg-inner" /></div>
          <div className="bg"><div className="bg-inner" /></div>
        </div>

        {/* Password */}
        <div className="control block-cube block-input">
          <input
            placeholder="Password"
            type="password"
            name="password"
            value={formData.password}
            onChange={handleChange}
            disabled={isLoading}
          />
          <div className="bg-top"><div className="bg-inner" /></div>
          <div className="bg-right"><div className="bg-inner" /></div>
          <div className="bg"><div className="bg-inner" /></div>
        </div>

        {/* Age */}
        <div className="control block-cube block-input">
          <input
            placeholder="Age"
            type="number"
            name="age"
            value={formData.age}
            onChange={handleChange}
            min="18"
            disabled={isLoading}
          />
          <div className="bg-top"><div className="bg-inner" /></div>
          <div className="bg-right"><div className="bg-inner" /></div>
          <div className="bg"><div className="bg-inner" /></div>
        </div>

        {/* Profession */}
        <div className="control block-cube block-input">
          <input
            placeholder="Profession"
            type="text"
            name="profession"
            value={formData.profession}
            onChange={handleChange}
            disabled={isLoading}
          />
          <div className="bg-top"><div className="bg-inner" /></div>
          <div className="bg-right"><div className="bg-inner" /></div>
          <div className="bg"><div className="bg-inner" /></div>
        </div>

        {/* Submit Button */}
        <button
          type="submit"
          className="btn block-cube block-cube-hover"
          disabled={isLoading}
        >
          <span className="text">
            {isLoading ? "Registering..." : "Register"}
          </span>
          <div className="bg-top"><div className="bg-inner" /></div>
          <div className="bg-right"><div className="bg-inner" /></div>
          <div className="bg"><div className="bg-inner" /></div>
        </button>

        <p className="register-link">
          Already have an account? <a href="/login">Login here</a>
        </p>
      </form>
    </div>
  );
};

export default Register;
