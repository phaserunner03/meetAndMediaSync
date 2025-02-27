const dotenv = require("dotenv");
dotenv.config();
const authService = require("../services/authService");

async function redirectToGoogle(req, res) {
    try {
        const url = authService.getGoogleAuthURL();
        res.redirect(url);
    } catch (err) {
        res.status(500).json({ message: "Failed to redirect to Google", error: err.message });
    }
}

async function handleGoogleCallback(req, res) {
    try {
        const { code } = req.query;
        if (!code) {
            return res.status(400).json({ success: false, message: "Authorization code is missing" });
        }

        const result = await authService.processGoogleAuth(code);
        res.json(result);  // Send token and user data back to frontend
    } catch (err) {
        res.status(401).json({ success: false, message: err.message });
    }
}

module.exports = { redirectToGoogle, handleGoogleCallback };
