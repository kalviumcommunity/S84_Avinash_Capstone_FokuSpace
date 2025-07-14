import React, { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { resetPassword } from "../../api";
import "../../styles/pages css/ResetPassword.css";

const ResetPassword = () => {
  const [formData, setFormData] = useState({ newPassword: "" });
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  const query = new URLSearchParams(location.search);
  const resetToken = query.get("token");

  const handleChange = (e) =>
    setFormData({ ...formData, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);

    console.log("Reset password attempt");
    if (!formData.newPassword) {
      setError("Please enter a new password");
      setIsLoading(false);
      return;
    }
    if (
      !/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[\W_]).{8,}$/.test(
        formData.newPassword
      )
    ) {
      setError(
        "Password must be at least 8 characters long and include uppercase, lowercase, number, and special character."
      );
      setIsLoading(false);
      return;
    }

    try {
      await resetPassword({ resetToken, newPassword: formData.newPassword });
      console.log("Password reset successful");
      alert("Password reset successfully");
      navigate("/login");
    } catch (err) {
      console.error("Reset password error:", err);
      setError(err || "Failed to reset password");
    } finally {
      setIsLoading(false);
    }
  };

  if (!resetToken) {
    console.warn("No reset token, redirecting to reset-password-request");
    navigate("/reset-password-request");
    return null;
  }

  return (
    <div className="reset__page">
      <div className="reset__ring reset__ring--one" />
      <div className="reset__ring reset__ring--two" />

      <div className="reset__card">
        <h2 className="reset__heading">Reset Password</h2>

        {error && <p className="reset__error">{error}</p>}

        <form onSubmit={handleSubmit}>
          <div className="reset__group">
            <label className="reset__label">New Password:</label>
            <input
              className="reset__input"
              name="newPassword"
              type="password"
              value={formData.newPassword}
              onChange={handleChange}
              disabled={isLoading}
            />
          </div>

          <button className="reset__btn" disabled={isLoading}>
            {isLoading ? "Resetting..." : "Reset Password"}
          </button>
        </form>

        <p className="reset__link-wrap">
          Back to <a href="/login">Login</a>
        </p>
      </div>
    </div>
  );
};

export default ResetPassword;
