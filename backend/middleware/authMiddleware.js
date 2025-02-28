const jwt = require('jsonwebtoken');
const User = require('../models/User');

const authMiddleware = async (req, res, next) => {
  try {

    const token = req.header('authToken');
    const decoded = jwt.verify(token, process.env.SECRET_KEY);
    const user = await User.findOne({ googleId: decoded.uid });
    req.user = user;
    req.token = token;
    next();
  } catch (error) {
    res.status(401).json({ message: 'Unauthorized: Invalid token' });
  }
};

module.exports = authMiddleware;