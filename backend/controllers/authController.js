// const axios = require('axios');
const bcrypt = require('bcryptjs');
const { OAuth2Client } = require('google-auth-library');
const dotenv = require('dotenv');
const User = require('../models/User'); 
const { generateToken } = require('../middleware/auth');

dotenv.config();

const GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID;

const client = new OAuth2Client(GOOGLE_CLIENT_ID);

// **Manual Email/Password Login**
const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;

    
    const user = await User.findOne({ email });
    if (!user) return res.status(400).json({ message: "User not found." });

    
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(400).json({ message: "Invalid credentials." });

    
    const token = generateToken(user);
    res.json({ token, user });
  } catch (err) {
    res.status(500).json({ message: "Internal server error." });
  }
};

// **Google SSO Login**
const googleLogin = async (req, res) => {
  try {
    const { token } = req.body; 

    
    const ticket = await client.verifyIdToken({
      idToken: token,
      audience: GOOGLE_CLIENT_ID,
    });

    const { email, given_name, family_name, picture } = ticket.getPayload();

    
    let user = await User.findOne({ email });

    if (!user) {
      
      user = new User({
        email,
        firstName: given_name,
        lastName: family_name,
        profilePic: picture,
        role: 'user', 
      });

      await user.save();
    }

    const jwtToken = generateToken(user);
    res.json({ token: jwtToken, user });

  } catch (err) {
    res.status(400).json({ message: "Invalid Google token." });
  }
};

// Register a New User with Email/Password
const registerUser = async (req, res) => {
  try {
    const { email, password, firstName, lastName, role } = req.body;

    
    let user = await User.findOne({ email });
    if (user) return res.status(400).json({ message: "User already exists." });

    const hashedPassword = await bcrypt.hash(password, 10);

    user = new User({
      email,
      password: hashedPassword,
      firstName,
      lastName,
      profilePic: "",
      role: role || "user", // Default role: user
    });

    await user.save();

    const token = generateToken(user);
    res.json({ token, user });

  } catch (err) {
    res.status(500).json({ message: "Internal server error." });
  }
};


module.exports = { loginUser, googleLogin, registerUser };
