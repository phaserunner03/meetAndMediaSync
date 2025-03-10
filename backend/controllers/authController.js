const dotenv = require("dotenv");
dotenv.config();
const authService = require("../services/authService");
const jwt = require("jsonwebtoken");
const User = require("../models/User");
const Role = require("../models/Role");

async function redirectToGoogle(req, res) {
    try {
        const token = req.cookies.token;

        if (token) {
            try {
                const decoded = jwt.verify(token, process.env.SECRET_KEY);
                
                // Fetch user using googleId from token
                const user = await User.findOne({ googleId: decoded.uid });

                if (!user) throw new Error("User not found");

                // If user exists, redirect to dashboard
                return res.redirect(`${process.env.FRONTEND_URL}/dashboard`);
            } catch (err) {
                console.log("JWT expired or invalid. Trying refresh token...");
                const { refreshToken } = req.cookies;
                if (refreshToken) {
                    try {
                        const newToken = await authService.refreshAccessToken(refreshToken);
                        res.cookie("token", newToken, {
                            httpOnly: true,
                            secure: process.env.NODE_ENV === "production",
                            sameSite: process.env.NODE_ENV === "production" ? "Strict" : "Lax",
                            maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
                        });
                        return res.redirect(`${process.env.FRONTEND_URL}/dashboard`);
                    } catch (refreshErr) {
                        console.log("Error refreshing access token:", refreshErr);
                    }
                }
            }
        }

        console.log("No valid session. Redirecting to Google OAuth...");
        const url = authService.getGoogleAuthURL();
        res.redirect(url);
    } catch (err) {
        res.status(500).json({ message: "Failed to authenticate", error: err.message });
    }
}


async function handleGoogleCallback(req, res) {
    try {
        const { code } = req.query;
        if (!code) {
            return res.status(400).json({ success: false, message: "Authorization code is missing" });
        }

        const result = await authService.processGoogleAuth(code);

        if (!result.success) {
            return res.status(401).json({ success: false, message: result.message });
        }

        // Set JWT token in an HTTP-only cookie
        res.cookie("token", result.token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            sameSite: process.env.NODE_ENV === "production" ? "Strict" : "Lax",
            maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
        });

        res.cookie("refreshToken", result.refresh_token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            sameSite: process.env.NODE_ENV === "production" ? "Strict" : "Lax",
            maxAge: 30 * 24 * 60 * 60 * 1000, // 30 days
        });

        // Redirect user to frontend dashboard
        res.redirect(`${process.env.FRONTEND_URL}/dashboard`);
    } catch (err) {
        res.status(401).json({ success: false, message: err.message });
    }
}

// New API to notify admin to add user
async function notifyAdmin(req, res) {
    try {
        const { email } = req.body;
        await authService.notifyAdminToAddUser({ email });
        res.json({ success: true, message: "Admin notified successfully" });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
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

async function refreshAccessToken(req, res) {
    try {
        const { refreshToken } = req.cookies;
        if (!refreshToken) {
            return res.status(400).json({ success: false, message: "Refresh token is missing" });
        }

        const newToken = await authService.refreshAccessToken(refreshToken);

        // Set new JWT token in an HTTP-only cookie
        res.cookie("token", newToken, {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            sameSite: process.env.NODE_ENV === "production" ? "Strict" : "Lax",
            maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
        });

        res.json({ success: true, token: newToken });
    } catch (err) {
        res.status(401).json({ success: false, message: err.message });
    }
}

async function addUser(req, res) {
    try {
        const { email, role } = req.body;
        const user = await authService.addUser(email, role);
        res.status(201).json({ success: true, user });
    } catch (err) {
        res.status(400).json({ success: false, message: err.message });
    }
}

async function addRole(req, res) {
    try {
        const { name, permissions } = req.body;
        const role = await authService.addRole(name, permissions);
        res.status(201).json({ success: true, role });
    } catch (err) {
        res.status(400).json({ success: false, message: err.message });
    }
}

async function editUserRole(req, res) {
    try {
        const { userId, newRole } = req.body;
        const user = await authService.editUserRole(userId, newRole);
        res.status(200).json({ success: true, user });
    } catch (err) {
        res.status(400).json({ success: false, message: err.message });
    }
}

async function deleteUser(req, res) {
    try {
        const { userId } = req.body;
        await authService.deleteUser(userId);
        res.status(200).json({ success: true, message: "User deleted successfully" });
    } catch (err) {
        res.status(400).json({ success: false, message: err.message });
    }
}

module.exports = { redirectToGoogle, handleGoogleCallback, getUser, logoutUser, refreshAccessToken, addUser, addRole, notifyAdmin, editUserRole, deleteUser };
