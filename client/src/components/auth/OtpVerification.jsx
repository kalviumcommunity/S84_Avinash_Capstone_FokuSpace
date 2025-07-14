import React, { useState, useEffect, useRef } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { verifyOtp, resendOtp } from "../../api";
import "../../styles/auth-css/OtpVerification.scss";

const OTP_LENGTH = 6;

const VerifyOtp = () => {
  const [otpDigits, setOtpDigits] = useState(Array(OTP_LENGTH).fill(""));
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isResending, setIsResending] = useState(false);

  const inputsRef = useRef([]);
  const location = useLocation();
  const navigate = useNavigate();
  const email =
    location.state?.email || localStorage.getItem("pendingVerificationEmail");

  useEffect(() => {
    if (!email) {
      setError("No email provided. Please register again.");
      setTimeout(() => navigate("/register"), 3000);
    }
  }, [email, navigate]);

  const updateDigit = (idx, char) => {
    setOtpDigits((prev) => {
      const next = [...prev];
      next[idx] = char;
      return next;
    });
    setError("");
  };

  const handleKeyUp = (e, idx) => {
    const { key } = e;
    if (key === "Backspace") {
      if (otpDigits[idx]) {
        updateDigit(idx, "");
      } else if (idx > 0) {
        updateDigit(idx - 1, "");
        inputsRef.current[idx - 1]?.focus();
      }
      return;
    }
    // No need to handle other keys here
  };

  const handleChange = (e, idx) => {
    const value = e.target.value;
    const validChar = value.match(/[0-9a-z]/i) ? value[0] : "";
    if (validChar) {
      updateDigit(idx, validChar);
      if (idx < OTP_LENGTH - 1) {
        inputsRef.current[idx + 1]?.focus();
      }
    }
  };

  const handlePaste = (e) => {
    const paste = e.clipboardData.getData("text").slice(0, OTP_LENGTH);
    if (paste.match(/^[0-9a-z]{6}$/i)) {
      setOtpDigits(paste.split(""));
      inputsRef.current[OTP_LENGTH - 1]?.focus();
      setError("");
      e.preventDefault();
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);
    const otp = otpDigits.join("");
    if (otp.length !== OTP_LENGTH) {
      setError("Please enter a valid 6‑digit OTP");
      setIsLoading(false);
      return;
    }
    try {
      await verifyOtp({ email, otp });
      localStorage.removeItem("pendingVerificationEmail");
      alert("Email verified successfully");
      navigate("/login");
    } catch (err) {
      if (err === "User already verified.") {
        setError("Account already verified. Please log in.");
        setTimeout(() => navigate("/login"), 3000);
      } else {
        setError(err || "OTP verification failed");
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleResendOtp = async () => {
    setError("");
    setIsResending(true);
    try {
      await resendOtp({ email });
      alert("A new OTP has been sent to your email");
    } catch (err) {
      setError(err || "Failed to resend OTP");
    } finally {
      setIsResending(false);
    }
  };

  if (!email) return null;

  return (
    <div className="otpVerify">
      <h1 className="otpVerify__heading">Enter OTP</h1>
      <form className="otpVerify__form" onSubmit={handleSubmit}>
        <div
          className="otpVerify__field"
          onPaste={handlePaste}
          onKeyDown={(e) => e.key === " " && e.preventDefault()}
        >
          {otpDigits.map((digit, i) => (
            <input
              key={i}
              ref={(el) => (inputsRef.current[i] = el)}
              type="text"
              inputMode="numeric"
              pattern="\d*"
              maxLength="1"
              value={digit}
              onChange={(e) => handleChange(e, i)}
              onKeyUp={(e) => handleKeyUp(e, i)}
              className={
                i === 2 ? "otpVerify__input space" : "otpVerify__input"
              }
              disabled={isLoading}
            />
          ))}
        </div>
        {error && <p className="otpVerify__error">{error}</p>}
        <button
          type="submit"
          className="otpVerify__button verify__otp"
          disabled={isLoading}
        >
          {isLoading ? "Verifying…" : "Verify OTP"}
        </button>
      </form>
      <button
        onClick={handleResendOtp}
        className="otpVerify__button otpVerify__button--secondary"
        disabled={isResending}
      >
        {isResending ? "Sending…" : "Resend OTP"}
      </button>
    </div>
  );
};

export default VerifyOtp;
