import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { resetPasswordRequest } from "../../api";
import "../../styles/pages-css/ResetPasswordRequest.css";

const ResetPasswordRequest = () => {
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);

    console.log("Password reset request for:", email);
    if (!email) {
      setError("Please enter your email");
      setIsLoading(false);
      return;
    }

    try {
      await resetPasswordRequest({ email });
      console.log("Reset link sent to:", email);
      alert("Password reset link sent to your email");
      navigate("/login");
    } catch (err) {
      console.error("Reset password request error:", err);
      setError(err || "Failed to send reset link");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="resetreq__page">
      <div className="resetreq__ring resetreq__ring--one" />
      <div className="resetreq__ring resetreq__ring--two" />

      <div className="resetreq__card">
        <h2 className="resetreq__heading">Reset Password</h2>

        {error && <p className="resetreq__error">{error}</p>}

        <form onSubmit={handleSubmit}>
          <div className="resetreq__group">
            <label className="resetreq__label">Email:</label>
            <input
              className="resetreq__input"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              disabled={isLoading}
            />
          </div>

          <button className="resetreq__btn" disabled={isLoading}>
            {isLoading ? "Sending..." : "Send Reset Link"}
          </button>
        </form>

        <p className="resetreq__link-wrap">
          Back to <a href="/login">Login</a>
        </p>
      </div>
    </div>
  );
};

export default ResetPasswordRequest;
