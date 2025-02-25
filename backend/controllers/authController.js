const dotenv = require('dotenv');
dotenv.config();
const authService = require('../services/authService');

async function signup(req, res) {
    try {
        const result = await authService.signup();
        res.json({
            message: "User Registration"
        });
    } catch (err) {
        console.log(err);
    }
}
async function login(req, res) {
    try {
        const result = await authService.login();
        res.json({
            message: "User Login"
        });
    } catch (err) {
        console.log(err);
    }
}
async function signInWithGoogle(req, res) {
    const {idToken} = req.body;
    
    if (!idToken) {
      return res.status(400).json({ success: false, message: "ID token is required" });
    }
  
    try {
      const result = await authService.signInWithGoogle(idToken);
      res.json(result);
    } catch (error) {
      res.status(401).json({ success: false, message: error.message });
    }
}
module.exports = { signup, login, signInWithGoogle };
