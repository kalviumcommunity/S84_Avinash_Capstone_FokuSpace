const express = require("express");
const { body, validationResult } = require("express-validator");
const User = require("../models/User");
const generateOTP = require("../helpers/otp");
const sendOTPEmail = require("../helpers/email");
const {otpLimiter} = require('../middleware/rateLimiter');

const router = express.Router();

// Verify OTP
router.post(
  '/verify-otp', otpLimiter,
  [
    body('email').isEmail().withMessage('Please provide a valid email address.'),
    body('otp').notEmpty().withMessage('OTP is required.'),
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      console.warn('Validation errors:', errors.array());
      return res.status(400).json({ error: { message: errors.array()[0].msg } });
    }

    try {
      const { email, otp } = req.body;
      const user = await User.findOne({ email });
      if (!user) {
        console.warn('User not found:', email);
        return res.status(404).json({ error: { message: 'User not found.' } });
      }

      if (user.isVerified) {
        console.warn('User already verified:', email);
        return res.status(400).json({ error: { message: 'User already verified.' } });
      }

      if (user.otp !== otp) {
        console.warn('Invalid OTP for:', email);
        return res.status(400).json({ error: { message: 'Invalid OTP.' } });
      }

      user.isVerified = true;
      user.otp = undefined;
      user.otpExpiry = undefined;
      await user.save();

      res.status(200).json({ message: 'Email verified successfully.' });
    } catch (err) {
      console.error('Verify OTP error:', err);
      res.status(500).json({ error: { message: 'Server error.' } });
    }
  }
);

// Resend OTP
router.post(
  '/resend-otp', otpLimiter,
  [body('email').isEmail().withMessage('Please provide a valid email address.')],
  async (req, res) => {
    console.log('Resend OTP request:', req.body.email);
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      console.warn('Validation errors:', errors.array());
      return res.status(400).json({ error: { message: errors.array()[0].msg } });
    }

    try {
      const { email } = req.body;
      const user = await User.findOne({ email });
      if (!user) {
        console.warn('User not found:', email);
        return res.status(404).json({ error: { message: 'User not found.' } });
      }

      if (user.isVerified) {
        console.warn('User already verified:', email);
        return res.status(400).json({ error: { message: 'User is already verified.' } });
      }

      const newOtp = generateOTP();
      const otpExpiry = Date.now() + 15 * 60 * 1000;

      user.otp = newOtp;
      user.otpExpiry = otpExpiry;
      await user.save();
      console.log('New OTP generated for:', email);

      try {
        await sendOTPEmail(email, `Your new OTP code is: ${newOtp}`);
        res.status(200).json({ message: 'New OTP sent to your email.' });
      } catch (emailError) {
        console.error('Failed to send OTP email to:', email, emailError);
        user.otp = undefined;
        user.otpExpiry = undefined;
        await user.save();
        throw new Error('Failed to send OTP email.');
      }
    } catch (err) {
      console.error('Resend OTP error:', err);
      res.status(500).json({ error: { message: err.message || 'Server error.' } });
    }
  }
); 
module.exports = router;