const express = require('express');
const router = express.Router();
const User = require("../models/User");
const bcrypt = require('bcryptjs');
require('dotenv').config();
const passport = require('passport');
const jwt = require('jsonwebtoken');
const { body, validationResult } = require('express-validator');    
const generateOTP = require('../helpers/otp');
const sendOTPEmail = require('../helpers/email');
const authenticate = require('../middleware/jwtmiddleware')

router.use(express.json());

router.post('/register', [
    body('email').isEmail().withMessage('Please provide a valid email address.'),
    body('password').isLength({ min: 8 }).withMessage('Password must be at least 8 characters long.'),
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

        res.status(200).json({ message: 'OTP sent to email. Please verify to complete registration.', user: newUser });

    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Server error, please try again later.' });
    }
});


router.put('/edit/user', authenticate, [
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


router.get('/users', async(req, res) => {
    try{
        res.send(`This is get endpoint!`)
    }catch(err){
        res.status(500).json({error: err.message})
    }
});

module.exports = router