const jwt = require('jsonwebtoken');
const dotenv = require('dotenv');
dotenv.config();

const SECRET_KEY = process.env.JWT_SECRET;

// middleware to authenticate user
const authenticateUser = (req, res, next) => {
  const token = req.header('Authorization');
  if (!token) return res.status(401).json({ message: "Access denied. No token provided." });

  try {
    const decoded = jwt.verify(token.replace("Bearer ", ""), SECRET_KEY);
    req.user = decoded; // store user details in req object
    next();
  } catch (err) {
    return res.status(403).json({ message: "Invalid or expired token." });
  }
};

// for role based authorization
const authorizeRole = (roles) => {
  return (req, res, next) => {
    if (!req.user || !roles.includes(req.user.role)) {
      return res.status(403).json({ message: "Access denied. Insufficient permissions." });
    }
    next();
  };
};

// generate token
const generateToken = (user) => {
  return jwt.sign(
    { id: user._id, role: user.role, email: user.email },
    SECRET_KEY,
    { expiresIn: "7d" }
  );
};

module.exports = { authenticateUser, authorizeRole, generateToken };
