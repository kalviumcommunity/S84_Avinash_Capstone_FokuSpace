const mongoose = require("mongoose");

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Name is required"],
    },
    email: {
      type: String,
      required: [true, "Email is required"],
      unique: true,
    },
    password: {
      type: String,
      required: [true, "Password is required"],
      validate: {
        validator: function (value) {
          return /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[\W_]).{8,}$/.test(value);
        },
        message:
          "Password must be at least 8 characters long and include uppercase, lowercase, number, and special character.",
      },
    },
    age: {
      type: Number,
      required: [true, "Age is required"],
    },
    profession: {
      type: String,
      required: [true, "Profession is required"],
    },
    isGoogleAccount: {
      type: Boolean,
      default: false,
    },
    isVerified: {
      type: Boolean,
      default: false,
    },
    otp: {
        type: String,
      },
      otpExpiry: {
        type: Date,
      },
  },
  { timestamps: true }
);

module.exports = mongoose.model("User", userSchema);