const express = require("express");
const passport = require("passport");
const mongoose = require("mongoose");
require("dotenv").config();
const cors = require("cors");
const helmet = require("helmet");
const rateLimit = require("express-rate-limit");
const connectToDb = require("./database/database");
const userRoutes = require("./routes/route");

const app = express();

// Validate environment variables
//  const requiredEnvVars = [
//    'DB_URL',
//    'JWT_SECRET',
//    'EMAIL_FROM',
//    'EMAIL_PASS',
//    'GOOGLE_CLIENT_ID',
//    'GOOGLE_CLIENT_SECRET',
//    'GOOGLE_CALLBACK_URL',
//    'CLIENT_URL',
//  ];
//  const missingEnvVars = requiredEnvVars.filter((envVar) => !process.env[envVar]);
//  if (missingEnvVars.length > 0) {
//    console.error(`Missing environment variables: ${missingEnvVars.join(', ')}`);
//    process.exit(1);
//  }

// Middleware
app.use(express.json());
app.use(helmet());
app.use(passport.initialize());

// CORS configuration
const allowedOrigins = [process.env.CLIENT_URL, 'http://localhost:9000'];
app.use(
  cors({
    origin: (origin, callback) => {
      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        console.warn(`CORS blocked for origin: ${origin}`);
        callback(new Error("Not allowed by CORS"));
      }
    },
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
    credentials: true,
  })
);

// Rate limiting for sensitive routes
//  const limiter = rateLimit({
//    windowMs: 15 * 60 * 1000, // 15 minutes
//    max: 100, // Limit each IP to 100 requests per windowMs
//  });
//  app.use('/accounts', limiter);

// Routes
app.get("/", (req, res) => {
  console.log("GET / request received");
  res.send(`FokuSpace server is running 🚀`);
});

app.use("/accounts", userRoutes);

// Catch-all for unmatched routes
app.use((req, res) => {
  console.warn(`Route not found: ${req.method} ${req.url}`);
  res.status(404).json({ error: { message: "Route not found" } });
});

// Global error handling
app.use((err, req, res, next) => {
  console.error("Global error:", err.stack);
  const status = err.status || 500;
  const message = err.message || "Something went wrong!";
  res.status(status).json({
    error: {
      message,
      status,
      ...(process.env.NODE_ENV === "development" && { stack: err.stack }),
    },
  });
});

// MongoDB connection and server start
const Port = process.env.PORT || 9000;
const Db_url = process.env.DB_URL;

mongoose.connection.on("error", (err) => {
  console.error("MongoDB connection error:", err);
});
mongoose.connection.on("disconnected", () => {
  console.warn("MongoDB disconnected, attempting to reconnect...");
});

app.listen(Port, async () => {
  try {
    await connectToDb(Db_url);
    console.log(`Connected to database`);
    console.log(`Server is running on http://localhost:${Port}`);
  } catch (err) {
    console.error("Database connection error:", err);
    process.exit(1);
  }
});
