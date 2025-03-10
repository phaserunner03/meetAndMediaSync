const { google } = require("googleapis");
const User = require("../models/User");
const Role = require("../models/Role");
const jwt = require("jsonwebtoken");
const nodemailer = require("nodemailer");

const SECRET_KEY = process.env.SECRET_KEY;
const CLIENT_ID = process.env.GOOGLE_CLIENT_ID;
const CLIENT_SECRET = process.env.GOOGLE_CLIENT_SECRET;
const REDIRECT_URI = process.env.GOOGLE_REDIRECT_URI;
const ADMIN_EMAIL = process.env.ADMIN_EMAIL;
const SMTP_HOST = process.env.SMTP_HOST;
const SMTP_PORT = process.env.SMTP_PORT;
const SMTP_USER = process.env.SMTP_USER;
const SMTP_PASS = process.env.SMTP_PASS;

const oauth2Client = new google.auth.OAuth2(CLIENT_ID, CLIENT_SECRET, REDIRECT_URI);

// Generates the Google OAuth2 URL
function getGoogleAuthURL() {
    try {
        return oauth2Client.generateAuthUrl({
            access_type: "offline",
            prompt: "consent",
            scope: [
                "profile",
                "email",
                "https://www.googleapis.com/auth/calendar", // Allows creating/editing events, Allows reading events
            ],
        });
    } catch (err) {
        console.error("Error generating Google Auth URL:", err);
        throw new Error("Failed to generate Google Auth URL");
    }
}

// Exchanges authorization code for access token
async function processGoogleAuth(code) {
    try {
        const { tokens } = await oauth2Client.getToken(code);
        oauth2Client.setCredentials(tokens);

        // Fetch user info from Google
        const oauth2 = google.oauth2({ version: "v2", auth: oauth2Client });
        const { data } = await oauth2.userinfo.get();

        // Check if user exists
        let user = await User.findOne({ email: data.email });
        if (!user) {
            // Notify admin to add the user
            await notifyAdminToAddUser(data);
            return { success: false, message: "You are not authorized to access this website" };
        }

        if (!user.displayName) {
            user.displayName = data.name;
        }
        if (!user.photoURL) {
            user.photoURL = data.picture;
        }
        if (!user.googleId) {
            user.googleId = data.id;
        }
        user.accessToken = tokens.access_token;
        user.refreshToken = tokens.refresh_token || user.refreshToken; // Preserve refresh token if not returned

        await user.save();

        // Generate JWT
        const jwtToken = generateJWT(user);
        const refresh_token = user.refreshToken;
        return { success: true, token: jwtToken, refresh_token };
    } catch (err) {
        console.error("Error processing Google OAuth:", err);
        throw new Error("Authentication failed");
    }
}

// Notify admin to add the user
async function notifyAdminToAddUser(userInfo) {
    try {
        const transporter = nodemailer.createTransport({
            host: SMTP_HOST,
            port: SMTP_PORT,
            secure: false, // true for 465, false for other ports
            auth: {
                user: SMTP_USER,
                pass: SMTP_PASS,
            },
        });

        const mailOptions = {
            from: `"No Reply" <${SMTP_USER}>`,
            to: ADMIN_EMAIL,
            subject: "New User Access Request",
            text: `A new user with email ${userInfo.email} has requested access.`,
            html: `
                <div style="font-family: Arial, sans-serif; line-height: 1.6;">
                    <h2 style="color: #333;">New User Access Request</h2>
                    <p>A new user has requested access to the system. Here are the details:</p>
                    <ul>
                        <li><strong>Name:</strong> ${userInfo.name}</li>
                        <li><strong>Email:</strong> ${userInfo.email}</li>
                    </ul>
                    <p>Please review and take the necessary action.</p>
                    <p>Thank you,</p>
                    <p><em>Your Team</em></p>
                </div>
            `,
        };

        await transporter.sendMail(mailOptions);
        console.log(`Notification sent to admin for user: ${userInfo.email}`);
    } catch (err) {
        console.error("Error notifying admin:", err);
        throw new Error("Failed to notify admin");
    }
}

function generateJWT(user) {
    try {
        return jwt.sign(
            { uid: user.googleId, email: user.email },
            SECRET_KEY,
            { expiresIn: "7d" }
        );
    } catch (err) {
        console.error("Error generating JWT:", err);
        throw new Error("Failed to generate JWT");
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

async function refreshAccessToken(refreshToken) {
    try {
        oauth2Client.setCredentials({ refresh_token: refreshToken });
        const { credentials } = await oauth2Client.refreshAccessToken();
        const newToken = jwt.sign({ googleId: credentials.id_token }, SECRET_KEY, { expiresIn: "7d" });

        return newToken;
    } catch (err) {
        console.error("Error refreshing access token:", err);
        throw new Error("Failed to refresh access token");
    }
}

async function addUser(email, role) {
    try {
        const roleDoc = await Role.findOne({ name: role });
        if (!roleDoc) {
            throw new Error("Invalid role");
        }

        const user = new User({ email, role: roleDoc._id });
        await user.save();
        return user;
    } catch (err) {
        console.error("Error adding user:", err);
        throw new Error("Failed to add user");
    }
}

async function addRole(name, permissions) {
    try {
        const role = new Role({ name, permissions });
        await role.save();
        return role;
    } catch (err) {
        console.error("Error adding role:", err);
        throw new Error("Failed to add role");
    }
}

async function editUserRole(userId, newRole) {
    try {
        const roleDoc = await Role.findById(newRole);
        if (!roleDoc) {
            throw new Error("Invalid role");
        }

        const user = await User.findById(userId);
        if (!user) {
            throw new Error("User not found");
        }

        user.role = newRole;
        await user.save();
        return user;
    } catch (err) {
        console.error("Error editing user role:", err);
        throw new Error("Failed to edit user role");
    }
}

async function deleteUser(userId) {
    try {
        const user = await User.findByIdAndDelete(userId);
        if (!user) {
            throw new Error("User not found");
        }
        return user;
    } catch (err) {
        console.error("Error deleting user:", err);
        throw new Error("Failed to delete user");
    }
}

module.exports = { getGoogleAuthURL, processGoogleAuth, getAuthenticatedUser, refreshAccessToken, notifyAdminToAddUser, addUser, addRole, editUserRole, deleteUser };
