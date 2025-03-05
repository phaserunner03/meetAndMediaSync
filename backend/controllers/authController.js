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

        // Set JWT token in an HTTP-only cookie
        res.cookie("token", result.token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            sameSite: process.env.NODE_ENV === "production" ? "Strict" : "Lax",
            maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
        });

        // Redirect user to frontend dashboard
        res.redirect(`${process.env.FRONTEND_URL}/dashboard`);
    } catch (err) {
        res.status(401).json({ success: false, message: err.message });
    }
}

async function getUser(req, res) {
    try {
        const user = await authService.getAuthenticatedUser(req.user.googleId);
        res.json({ success: true, user });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
}

async function logoutUser(req, res) {
    res.clearCookie("token", { httpOnly: true, secure: process.env.NODE_ENV === "production", sameSite: process.env.NODE_ENV === "production" ? "Strict" : "Lax"});
    res.json({ success: true, message: "Logged out successfully" });
}

module.exports = { redirectToGoogle, handleGoogleCallback, getUser, logoutUser };
