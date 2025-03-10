const jwt = require('jsonwebtoken');
const User = require('../models/User');
const Role = require('../models/Role');

const authMiddleware = async (req, res, next) => {
  try {
    let token = req.header('authToken');
    if (!token) {
      token = req.cookies?.token; // Read from HTTP-only cookie
    }
    if(!token){
      return res.status(401).json({ message: 'Unauthorized'} );
    }

    const decoded = jwt.verify(token, process.env.SECRET_KEY);
    const user = await User.findOne({ googleId: decoded.uid }).populate('role');
    if (!user) {
      return res.status(401).json({ message: 'User not found'});
    }
    req.user = user;
    req.token = token;
    next();
  } catch (error) {
    res.status(401).json({ message: 'Unauthorized: Invalid token' });
  }
};

const restrictTo = (permissions) => {
  return (req, res, next) => {
    if (!req.user.role.permissions.includes(permissions)) {
      return res.status(403).json({ message: 'Access denied: Insufficient permissions' });
    }
    next();
  };
};

module.exports = { authMiddleware, restrictTo };