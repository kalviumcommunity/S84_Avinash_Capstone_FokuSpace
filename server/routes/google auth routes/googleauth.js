const passport = require("passport");
const GoogleStrategy = require("passport-google-oauth20").Strategy;
const User = require("../../models/User");
const jwt = require("jsonwebtoken");
require("dotenv").config();
const express = require('express')

const router = express.Router();


// Passport serialization
passport.serializeUser((user, done) => {
  console.log("Serializing user:", user._id);
  done(null, user._id);
});

passport.deserializeUser(async (id, done) => {
  console.log("Deserializing user:", id);
  try {
    const user = await User.findById(id);
    done(null, user);
  } catch (err) {
    console.error("Deserialize error:", err);
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
      console.log("Google OAuth profile:", profile.emails[0].value);
      try {
        let user = await User.findOne({ email: profile.emails[0].value });
        if (!user) {
          console.log("Creating new Google user:", profile.emails[0].value);
          user = new User({
            name: profile.displayName,
            email: profile.emails[0].value,
            isGoogleAccount: true,
            isVerified: true,
            age: 18,
            profession: "Unknown",
          });
          await user.save();
        }
        done(null, user);
      } catch (err) {
        console.error("Google OAuth error:", err);
        done(err);
      }
    }
  )
);

// Google OAuth routes
router.get(
  "/google",
  passport.authenticate("google", {
    scope: ["profile", "email"],
  })
);

router.get(
  "/google/callback",
  passport.authenticate("google", {
    failureRedirect: "/login",
    session: false,
  }),
  (req, res) => {
    console.log("Google callback for user:", req.user._id);
    const token = jwt.sign({ id: req.user._id }, process.env.JWT_SECRET, {
      expiresIn: "7d",
    });
    res.redirect(`${process.env.CLIENT_URL}/google/callback?token=${token}`);
  }
);
module.exports = router