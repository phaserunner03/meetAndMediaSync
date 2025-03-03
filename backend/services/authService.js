const { google } = require("googleapis");
const User = require("../models/User");
const jwt = require("jsonwebtoken");

const SECRET_KEY = process.env.SECRET_KEY;
const CLIENT_ID = process.env.GOOGLE_CLIENT_ID;
const CLIENT_SECRET = process.env.GOOGLE_CLIENT_SECRET;
const REDIRECT_URI = process.env.GOOGLE_REDIRECT_URI;

const oauth2Client = new google.auth.OAuth2(CLIENT_ID, CLIENT_SECRET, REDIRECT_URI);

// Generates the Google OAuth2 URL
function getGoogleAuthURL() {
    return oauth2Client.generateAuthUrl({
        access_type: "offline",
        prompt: "consent",
        scope: [
            "profile",
            "email",
            "https://www.googleapis.com/auth/calendar", // Allows creating/editing events, Allows reading events
        ],
    });
}

// Exchanges authorization code for access token
async function processGoogleAuth(code) {
    try {
        const { tokens } = await oauth2Client.getToken(code);
        oauth2Client.setCredentials(tokens);

        // Fetch user info
        const oauth2 = google.oauth2({ version: "v2", auth: oauth2Client });
        const { data } = await oauth2.userinfo.get();

        // Save or update user in database
        console.log(data);
        let user = await User.findOne({ googleId: data.id });
        if (!user) {
            user = new User({
                googleId: data.id,
                displayName: data.name,
                email: data.email,
                photoURL: data.picture,
                role: "user",
                accessToken: tokens.access_token,
                refreshToken: tokens.refresh_token,
            });
        } else {
            user.accessToken = tokens.access_token;
            user.refreshToken = tokens.refresh_token;
        }
        await user.save();

        // Generate JWT token
        const jwtToken = jwt.sign(
            { uid: user.googleId, email: user.email },
            SECRET_KEY,
            { expiresIn: "7d" }
        );

        return { success: true, token: jwtToken };
    } catch (err) {
        console.error("Error processing Google OAuth:", err);
        throw new Error("Authentication failed");
    }
}

async function getAuthenticatedUser(userId) {
    try {
        const user = await User.findOne({ googleId: userId }).select("-refreshToken");

        if (!user) {
            throw new Error("User not found");
        }

        return {
            displayName: user.displayName,
            email: user.email,
            photoURL: user.photoURL,
            role: user.role
        };
    } catch (err) {
        console.error("Error fetching authenticated user:", err);
        throw new Error("Failed to fetch user data");
    }
}

module.exports = { getGoogleAuthURL, processGoogleAuth, getAuthenticatedUser };
