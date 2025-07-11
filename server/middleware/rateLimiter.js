const rateLimit = require("express-rate-limit");

const generalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  message: {
    error: {
      message: "Too many requests from this IP, please try again after 15 minutes.",
      status: 429
    }
  },
  standardHeaders: true,
  legacyHeaders: false,
});

const otpLimiter = rateLimit({
  windowMs: 10 * 60 * 1000,
  max: 5,
  keyGenerator: (req) => req.ip + (req.body.email || ''),
  message: {
    error: {
      message: "Too many OTP verification attempts. Please try again after 10 minutes.",
      status: 429
    }
  },
  standardHeaders: true,
  legacyHeaders: false,
});

module.exports = {
  generalLimiter,
  otpLimiter
};