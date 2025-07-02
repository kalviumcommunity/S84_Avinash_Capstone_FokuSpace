const jwt = require("jsonwebtoken");

const authenticate = (req, res, next) => {
  const token = req.header("Authorization")?.replace("Bearer ", "");
  console.log("Authenticating token:", token ? "[REDACTED]" : "No token");
  if (!token) {
    console.warn("No token provided for request:", req.url);
    return res.status(401).json({ error: { message: "No token provided." } });
  }
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    console.log("Token verified for user:", decoded.id);
    req.user = decoded;
    next();
  } catch (err) {
    console.error("Invalid token for request:", req.url, err.message);
    return res.status(401).json({ error: { message: "Invalid token." } });
  }
};

module.exports = authenticate;
