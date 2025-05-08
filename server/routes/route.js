const express = require('express');
const router = express.Router();
const User = require('../models/User');
const bcrypt = require('bcryptjs');
require('dotenv').config();
const jwt = require('jsonwebtoken');
const passport = require('passport');
const authenticate = require('../middleware/jwtmiddleware')
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const { body, validationResult } = require('express-validator');


// Middleware to parse JSON
router.use(express.json());

passport.use(new GoogleStrategy({
    clientID: process.env.GOOGLE_CLIENT_ID,
    clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    callbackURL: process.env.GOOGLE_CALLBACK_URL,
  },
  async (token, tokenSecret, profile, done) => {
    try {
      let user = await User.findOne({ email: profile.emails[0].value });
      if (!user) {
        user = new User({
          name: profile.displayName,
          email: profile.emails[0].value,
          isGoogleAccount: true,
          isVerified: true,
        });
        await user.save();
      }
      done(null, user);
    } catch (err) {
      done(err);
    }
  }
));

router.get('/google', passport.authenticate('google', {
    scope: ['profile', 'email'],
  }));

  router.get('/google/callback', passport.authenticate('google', { failureRedirect: '/login' }), (req, res) => {
    const token = jwt.sign({ id: req.user._id }, process.env.JWT_SECRET, { expiresIn: '7d' });
    res.status(200).json({ message: 'Login successful.', token });
  });


// Register a new user
router.post('/register', [
    body('email').isEmail().withMessage('Please provide a valid email address.'),
    body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters long.'),
], async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }

    try {
        const { name, email, password, age, profession } = req.body;

        // Check if email already exists
        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return res.status(400).json({ error: 'Email already exists.' });
        }

        // Generate OTP and set expiry time
        const otp = generateOTP();
        const otpExpiry = Date.now() + 15 * 60 * 1000; // OTP valid for 15 minutes

        // Send OTP to email
        await sendOTPEmail(email, otp);

        // Create a new user but don't mark them as verified yet
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

        res.status(200).json({ message: 'OTP sent to email. Please verify to complete registration.' });

    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Server error, please try again later.' });
    }
});

// Login a user
router.post('/login', [
    body('email').isEmail().withMessage('Please provide a valid email address.'),
    body('password').notEmpty().withMessage('Password is required.')
], async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }

    try {
        const { email, password } = req.body;

        // Find user by email
        const user = await User.findOne({ email });
        if (!user) {
            return res.status(404).json({ error: 'User not found.' });
        }

        // Check if the user is verified
        if (!user.isVerified) {
            return res.status(400).json({ error: 'Please verify your account before logging in.' });
        }

        // Compare entered password with hashed password in DB
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(400).json({ error: 'Invalid credentials.' });
        }

        // Generate a JWT token
        const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: '7d' });

        res.status(200).json({
            message: 'Login successful.',
            token,
        });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Server error, please try again later.' });
    }
});

// Profile route to fetch the user's own data
router.get('/profile', authenticate, async (req, res) => {
    try {
        const user = await User.findById(req.user.id).select('-password'); // Exclude password field
        res.status(200).json(user);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Server error, please try again later.' });
    }
});

router.put('/profile', authenticate, [
    body('name').optional().isString().withMessage('Name should be a string'),
    body('age').optional().isInt({ min: 18 }).withMessage('Age must be at least 18'),
    body('profession').optional().isString().withMessage('Profession should be a string'),
], async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }

    try {
        const { name, age, profession } = req.body;

        // Find the user by ID (from the JWT token)
        const user = await User.findById(req.user.id);
        if (!user) {
            return res.status(404).json({ error: 'User not found.' });
        }

        // Update the user profile
        if (name) user.name = name;
        if (age) user.age = age;
        if (profession) user.profession = profession;

        await user.save();  // Save the updated user

        res.status(200).json({
            message: 'Profile updated successfully.',
            user: { name: user.name, age: user.age, profession: user.profession }
        });
    } catch (err) {
        res.status(500).json({ error: 'Server error, please try again later.' });
    }
});




router.put('/change-password', authenticate, [
    body('currentPassword').notEmpty().withMessage('Current password is required.'),
    body('newPassword').isLength({ min: 6 }).withMessage('New password must be at least 6 characters long.')
], async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }

    try {
        const { currentPassword, newPassword } = req.body;

        // Find the user by ID (from the JWT token)
        const user = await User.findById(req.user.id);
        if (!user) {
            return res.status(404).json({ error: 'User not found.' });
        }

        // Check if the current password matches the user's password
        const isMatch = await bcrypt.compare(currentPassword, user.password);
        if (!isMatch) {
            return res.status(400).json({ error: 'Current password is incorrect.' });
        }

        // Hash the new password and save it
        const hashedNewPassword = await bcrypt.hash(newPassword, 10);
        user.password = hashedNewPassword;
        await user.save();

        res.status(200).json({ message: 'Password changed successfully.' });
    } catch (err) {
        res.status(500).json({ error: 'Server error, please try again later.' });
    }
});

// Get all users (excluding passwords)
router.get('/users', async (req, res) => {
    try {
        const users = await User.find({}, '-password'); // Exclude password field
        res.status(200).json({ message: "Users fetched successfully.", users });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Password Reset Request Route
router.post('/reset-password-request', async (req, res) => {
    const { email } = req.body;
    const user = await User.findOne({ email });
    if (!user) {
        return res.status(404).json({ error: "User not found." });
    }
    
    const resetToken = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: '1h' });

    // Send resetToken to user's email (you can use nodemailer for this)
    res.status(200).json({ message: "Password reset link sent to email." });
});

// Password Reset Route
router.post('/reset-password', async (req, res) => {
    const { resetToken, newPassword } = req.body;

    try {
        const decoded = jwt.verify(resetToken, process.env.JWT_SECRET);
        const user = await User.findById(decoded.id);
        if (!user) {
            return res.status(404).json({ error: "User not found." });
        }

        const hashedPassword = await bcrypt.hash(newPassword, 10);
        user.password = hashedPassword;
        await user.save();

        res.status(200).json({ message: "Password successfully reset." });
    } catch (err) {
        res.status(400).json({ error: "Invalid or expired token." });
    }
});

router.post('/verify-otp', async (req, res) => {
    const { email, otp } = req.body;

    try {
        const user = await User.findOne({ email });
        if (!user) return res.status(404).json({ error: 'User not found.' });

        if (user.isVerified) return res.status(400).json({ error: 'User already verified.' });

        if (user.otp !== otp || user.otpExpiry < Date.now()) {
            return res.status(400).json({ error: 'Invalid or expired OTP.' });
        }

        user.isVerified = true;
        user.otp = undefined;
        user.otpExpiry = undefined;
        await user.save();

        res.status(200).json({ message: 'Email verified successfully.' });
    } catch (err) {
        res.status(500).json({ error: 'Server error.' });
    }
});

router.post('/resend-otp', [
    body('email').isEmail().withMessage('Please provide a valid email address.')
], async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }

    try {
        const { email } = req.body;

        // Find user by email
        const user = await User.findOne({ email });
        if (!user) {
            return res.status(404).json({ error: 'User not found.' });
        }

        // Check if user is already verified
        if (user.isVerified) {
            return res.status(400).json({ error: 'User is already verified.' });
        }

        // Generate new OTP and set expiry time
        const newOtp = generateOTP();
        const otpExpiry = Date.now() + 15 * 60 * 1000; // OTP valid for 15 minutes

        // Update user with new OTP and expiry
        user.otp = newOtp;
        user.otpExpiry = otpExpiry;
        await user.save();

        // Send new OTP to email
        await sendOTPEmail(email, newOtp);

        res.status(200).json({ message: 'New OTP sent to your email.' });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Server error, please try again later.' });
    }
});


module.exports = router;
