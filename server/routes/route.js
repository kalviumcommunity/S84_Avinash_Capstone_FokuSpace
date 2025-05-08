const express = require('express');
const router = express.Router();
const User = require('../models/User');
const bcrypt = require('bcryptjs');
require('dotenv').config();
const jwt = require('jsonwebtoken');
const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const { body, validationResult } = require('express-validator');
const authenticate = require('../middleware/jwtmiddleware');
const generateOTP = require('../helpers/otp');
const sendOTPEmail = require('../helpers/email');

// Passport serialization
passport.serializeUser((user, done) => {
  console.log('Serializing user:', user._id);
  done(null, user._id);
});

passport.deserializeUser(async (id, done) => {
  console.log('Deserializing user:', id);
  try {
    const user = await User.findById(id);
    done(null, user);
  } catch (err) {
    console.error('Deserialize error:', err);
    done(err);
  }
});

// Google OAuth strategy
passport.use(
  new GoogleStrategy(
    {
      clientID: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      callbackURL: process.env.GOOGLE_CALLBACK_URL,
    },
    async (token, tokenSecret, profile, done) => {
      console.log('Google OAuth profile:', profile.emails[0].value);
      try {
        let user = await User.findOne({ email: profile.emails[0].value });
        if (!user) {
          console.log('Creating new Google user:', profile.emails[0].value);
          user = new User({
            name: profile.displayName,
            email: profile.emails[0].value,
            isGoogleAccount: true,
            isVerified: true,
            age: 18,
            profession: 'Unknown',
          });
          await user.save();
        }
        done(null, user);
      } catch (err) {
        console.error('Google OAuth error:', err);
        done(err);
      }
    }
  )
);

// Google OAuth routes
router.get(
  '/google',
  passport.authenticate('google', {
    scope: ['profile', 'email'],
  })
);

router.get(
  '/google/callback',
  passport.authenticate('google', { failureRedirect: '/login', session: false }),
  (req, res) => {
    console.log('Google callback for user:', req.user._id);
    const token = jwt.sign({ id: req.user._id }, process.env.JWT_SECRET, {
      expiresIn: '7d',
    });
    res.status(200).json({ message: 'Login successful.', token });
  }
);

// Register a new user
router.post(
  '/register',
  [
    body('email').isEmail().withMessage('Please provide a valid email address.'),
    body('password')
      .isLength({ min: 8 })
      .withMessage('Password must be at least 8 characters long.')
      .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[\W_]).{8,}$/)
      .withMessage(
        'Password must include uppercase, lowercase, number, and special character.'
      ),
    body('name').notEmpty().withMessage('Name is required.'),
    body('age').isInt({ min: 18 }).withMessage('Age must be at least 18.'),
    body('profession').notEmpty().withMessage('Profession is required.'),
  ],
  async (req, res) => {
    console.log('Register request:', req.body.email);
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      console.warn('Validation errors:', errors.array());
      return res.status(400).json({ error: { message: errors.array()[0].msg } });
    }

    try {
      const { name, email, password, age, profession } = req.body;
      const existingUser = await User.findOne({ email });
      if (existingUser) {
        console.warn('Email already exists:', email);
        return res.status(400).json({ error: { message: 'Email already exists.' } });
      }

      const otp = generateOTP();
      const otpExpiry = Date.now() + 15 * 60 * 1000;

      const newUser = new User({
        name,
        email,
        password: await bcrypt.hash(password, 10),
        age,
        profession,
        otp,
        otpExpiry,
        isVerified: false,
      });

      await newUser.save();
      console.log('User registered:', email);

      await sendOTPEmail(email, `Your OTP code is: ${otp}`);
      res.status(200).json({
        message: 'OTP sent to email. Please verify to complete registration.',
      });
    } catch (error) {
      console.error('Register error:', error);
      res.status(500).json({ error: { message: 'Server error, please try again later.' } });
    }
  }
);

// Verify OTP
router.post(
  '/verify-otp',
  [
    body('email').isEmail().withMessage('Please provide a valid email address.'),
    body('otp').notEmpty().withMessage('OTP is required.'),
  ],
  async (req, res) => {
    console.log('Verify OTP request:', req.body.email);
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
      if (user.otpExpiry < Date.now()) {
        console.warn('OTP expired for:', email);
        return res.status(400).json({ error: { message: 'OTP has expired.' } });
      }

      user.isVerified = true;
      user.otp = undefined;
      user.otpExpiry = undefined;
      await user.save();
      console.log('OTP verified for:', email);

      res.status(200).json({ message: 'Email verified successfully.' });
    } catch (err) {
      console.error('Verify OTP error:', err);
      res.status(500).json({ error: { message: 'Server error.' } });
    }
  }
);

// Resend OTP
router.post(
  '/resend-otp',
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

// Login a user
router.post(
  '/login',
  [
    body('email').isEmail().withMessage('Please provide a valid email address.'),
    body('password').notEmpty().withMessage('Password is required.'),
  ],
  async (req, res) => {
    console.log('Login request:', req.body.email);
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      console.warn('Validation errors:', errors.array());
      return res.status(400).json({ error: { message: errors.array()[0].msg } });
    }

    try {
      const { email, password } = req.body;
      const user = await User.findOne({ email });
      if (!user) {
        console.warn('User not found:', email);
        return res.status(400).json({ error: { message: 'Invalid credentials.' } });
      }

      if (!user.isVerified) {
        console.warn('User not verified:', email);
        return res
          .status(400)
          .json({ error: { message: 'Please verify your account before logging in.' } });
      }

      if (!user.isGoogleAccount) {
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
          console.warn('Invalid password for:', email);
          return res.status(400).json({ error: { message: 'Invalid credentials.' } });
        }
      }

      const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
        expiresIn: '1h',
      });
      console.log('Login successful for:', email, 'Token:', token);
      res.status(200).json({ token });
    } catch (err) {
      console.error('Login error:', err);
      res.status(500).json({ error: { message: 'Server error.' } });
    }
  }
);

// Profile route
router.get('/profile', authenticate, async (req, res) => {
  console.log('Profile request for user:', req.user.id);
  try {
    const user = await User.findById(req.user.id).select('-password -otp -otpExpiry');
    if (!user) {
      console.warn('User not found:', req.user.id);
      return res.status(404).json({ error: { message: 'User not found.' } });
    }
    res.status(200).json(user);
  } catch (err) {
    console.error('Profile error:', err);
    res.status(500).json({ error: { message: 'Server error.' } });
  }
});

// Update profile
router.put(
  '/profile',
  authenticate,
  [
    body('name')
      .optional()
      .isString()
      .withMessage('Name should be a string')
      .trim()
      .escape(),
    body('age')
      .optional()
      .isInt({ min: 18 })
      .withMessage('Age must be at least 18'),
    body('profession')
      .optional()
      .isString()
      .withMessage('Profession should be a string')
      .trim()
      .escape(),
  ],
  async (req, res) => {
    console.log('Update profile request for user:', req.user.id);
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      console.warn('Validation errors:', errors.array());
      return res.status(400).json({ error: { message: errors.array()[0].msg } });
    }

    try {
      const { name, age, profession } = req.body;
      const user = await User.findById(req.user.id);
      if (!user) {
        console.warn('User not found:', req.user.id);
        return res.status(404).json({ error: { message: 'User not found.' } });
      }

      if (name) user.name = name;
      if (age) user.age = age;
      if (profession) user.profession = profession;

      await user.save();
      console.log('Profile updated for:', req.user.id);
      res.status(200).json({
        message: 'Profile updated successfully.',
        user: { name: user.name, age: user.age, profession: user.profession },
      });
    } catch (err) {
      console.error('Update profile error:', err);
      res.status(500).json({ error: { message: 'Server error.' } });
    }
  }
);

// Change password
router.put(
  '/change-password',
  authenticate,
  [
    body('currentPassword')
      .notEmpty()
      .withMessage('Current password is required.'),
    body('newPassword')
      .isLength({ min: 8 })
      .withMessage('New password must be at least 8 characters long.')
      .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[\W_]).{8,}$/)
      .withMessage(
        'New password must include uppercase, lowercase, number, and special character.'
      ),
  ],
  async (req, res) => {
    console.log('Change password request for user:', req.user.id);
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      console.warn('Validation errors:', errors.array());
      return res.status(400).json({ error: { message: errors.array()[0].msg } });
    }

    try {
      const { currentPassword, newPassword } = req.body;
      const user = await User.findById(req.user.id);
      if (!user) {
        console.warn('User not found:', req.user.id);
        return res.status(404).json({ error: { message: 'User not found.' } });
      }

      if (user.isGoogleAccount) {
        console.warn('Google account password change attempted:', req.user.id);
        return res
          .status(400)
          .json({ error: { message: 'Google accounts cannot change passwords.' } });
      }

      const isMatch = await bcrypt.compare(currentPassword, user.password);
      if (!isMatch) {
        console.warn('Incorrect current password for:', req.user.id);
        return res
          .status(400)
          .json({ error: { message: 'Current password is incorrect.' } });
      }

      user.password = await bcrypt.hash(newPassword, 10);
      await user.save();
      console.log('Password changed for:', req.user.id);
      res.status(200).json({ message: 'Password changed successfully.' });
    } catch (err) {
      console.error('Change password error:', err);
      res.status(500).json({ error: { message: 'Server error.' } });
    }
  }
);

// Get all users (restricted to authenticated users)
router.get('/users', authenticate, async (req, res) => {
  console.log('Get users request by user:', req.user.id);
  try {
    const users = await User.find({}, '-password -otp -otpExpiry');
    res.status(200).json({ message: 'Users fetched successfully.', users });
  } catch (err) {
    console.error('Get users error:', err);
    res.status(500).json({ error: { message: 'Server error.' } });
  }
});

// Password reset request
router.post(
  '/reset-password-request',
  [
    body('email').isEmail().withMessage('Please provide a valid email address.'),
  ],
  async (req, res) => {
    console.log('Password reset request for:', req.body.email);
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

      if (user.isGoogleAccount) {
        console.warn('Google account password reset attempted:', email);
        return res
          .status(400)
          .json({ error: { message: 'Google accounts cannot reset passwords.' } });
      }

      const resetToken = jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
        expiresIn: '1h',
      });
      const resetLink = `${process.env.CLIENT_URL}/reset-password?token=${resetToken}`;

      await sendOTPEmail(
        email,
        `Click this link to reset your password: ${resetLink}`
      );
      console.log('Password reset link sent to:', email);
      res.status(200).json({ message: 'Password reset link sent to email.' });
    } catch (err) {
      console.error('Reset password request error:', err);
      res.status(500).json({ error: { message: 'Server error.' } });
    }
  }
);

// Password reset
router.post(
  '/reset-password',
  [
    body('resetToken').notEmpty().withMessage('Reset token is required.'),
    body('newPassword')
      .isLength({ min: 8 })
      .withMessage('New password must be at least 8 characters long.')
      .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[\W_]).{8,}$/)
      .withMessage(
        'New password must include uppercase, lowercase, number, and special character.'
      ),
  ],
  async (req, res) => {
    console.log('Password reset attempt');
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      console.warn('Validation errors:', errors.array());
      return res.status(400).json({ error: { message: errors.array()[0].msg } });
    }

    try {
      const { resetToken, newPassword } = req.body;
      const decoded = jwt.verify(resetToken, process.env.JWT_SECRET);
      console.log('Reset token verified for user:', decoded.id);
      const user = await User.findById(decoded.id);
      if (!user) {
        console.warn('User not found for reset:', decoded.id);
        return res.status(404).json({ error: { message: 'User not found.' } });
      }

      user.password = await bcrypt.hash(newPassword, 10);
      await user.save();
      console.log('Password reset successful for:', decoded.id);
      res.status(200).json({ message: 'Password successfully reset.' });
    } catch (err) {
      console.error('Reset password error:', err);
      if (err.name === 'TokenExpiredError') {
        return res.status(400).json({ error: { message: 'Reset token has expired.' } });
      }
      return res.status(400).json({ error: { message: 'Invalid reset token.' } });
    }
  }
);

module.exports = router;