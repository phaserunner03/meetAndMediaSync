import { google } from "googleapis";
import User from "../models/User";
import Role from "../models/Role";
import jwt from "jsonwebtoken";
import nodemailer from "nodemailer";
import mongoose, { Document } from 'mongoose';

const SECRET_KEY = process.env.SECRET_KEY ?? "default_secret_key";
const CLIENT_ID = process.env.GOOGLE_CLIENT_ID;
const CLIENT_SECRET = process.env.GOOGLE_CLIENT_SECRET;
const REDIRECT_URI = process.env.GOOGLE_REDIRECT_URI;
const ADMIN_EMAIL = process.env.ADMIN_EMAIL;
const SMTP_HOST = process.env.SMTP_HOST;
const SMTP_PORT = parseInt(process.env.SMTP_PORT!);
const SMTP_USER = process.env.SMTP_USER;
const SMTP_PASS = process.env.SMTP_PASS;

const oauth2Client = new google.auth.OAuth2(CLIENT_ID, CLIENT_SECRET, REDIRECT_URI);

interface UserDocument extends Document {
    googleId: string;
    displayName: string;
    email: string;
    role: mongoose.Schema.Types.ObjectId;
    photoURL: string;
    accessToken: string;
    refreshToken: string;
}

interface RoleDocument extends Document {
    name: string;
    permissions: string[];
}

function getGoogleAuthURL(): string {
    try {
        return oauth2Client.generateAuthUrl({
            access_type: "offline",
            prompt: "consent",
            scope: [
                "profile",
                "email",
                "https://www.googleapis.com/auth/calendar",
            ],
        });
    } catch (err) {
        console.error("Error generating Google Auth URL:", err);
        throw new Error("Failed to generate Google Auth URL");
    }
}

async function processGoogleAuth(code: string) {
    try {
        const { tokens } = await oauth2Client.getToken(code);
        oauth2Client.setCredentials(tokens);

        const oauth2 = google.oauth2({ version: "v2", auth: oauth2Client });
        const { data } = await oauth2.userinfo.get();

        let user = await User.findOne({ email: data.email });
        if (!user) {
            let role=await Role.findOne({name:"NAU"});
            user = new User({
                email: data.email,
                role: role?._id,
                googleId: data.id,
                displayName: data.name,
                photoURL: data.picture,
                accessToken: tokens.access_token!,
                refreshToken: tokens.refresh_token ?? ""
            });
            await user.save();
            await notifyAdminToAddUser(data);
            return { success: true, message: "You are not authorized to access this website" };
        }

        if (!user.displayName) {
            user.displayName = data.name ?? "Unknown";
        }
        if (!user.photoURL) {
            user.photoURL = data.picture ?? "default_photo_url";
        }
        if (!user.googleId) {
            user.googleId = data.id ?? user.googleId;
        }
        user.accessToken = tokens.access_token!;
        user.refreshToken = tokens.refresh_token || user.refreshToken;

        await user.save();

        const jwtToken = generateJWT(user);
        const refresh_token = user.refreshToken;
        return { success: true, token: jwtToken, refresh_token };
    } catch (err) {
        console.error("Error processing Google OAuth:", err);
        throw new Error("Authentication failed");
    }
}

async function notifyAdminToAddUser(userInfo: any) {
    try {
        const transporter = nodemailer.createTransport({
            host: SMTP_HOST,
            port: SMTP_PORT,
            secure: false,
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

function generateJWT(user: UserDocument): string {
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

async function getAuthenticatedUser(userId: string) {
    try {
        const user = await User.findOne({ googleId: userId })
            .select("-refreshToken")
            .populate<{ role: typeof Role }>("role", "name permissions");

        if (!user) {
            throw new Error("User not found");
        }
        return {
            displayName: user.displayName,
            email: user.email,
            photoURL: user.photoURL,
            role: {
                name: user.role.name,
                permissions: (user.role as unknown as RoleDocument).permissions,
            }
        };
    } catch (err) {
        console.error("Error fetching authenticated user:", err);
        throw new Error("Failed to fetch user data");
    }
}

async function refreshAccessToken(refreshToken: string) {
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

async function addUser(email: string, roleId: string) {
    try {
        const roleDoc = await Role.findById(roleId); 
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

async function addRole(name: string, permissions: string[]) {
    try {
        const role = new Role({ name, permissions });
        await role.save();
        return role;
    } catch (err) {
        console.error("Error adding role:", err);
        throw new Error("Failed to add role");
    }
}

async function editUserRole(userId: string, newRole: mongoose.Schema.Types.ObjectId) {
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
async function editRole(id: string, name: string, permissions: string[]) {
    try {
        const roleDoc = await Role.findById(id);
        if (!roleDoc) {
            throw new Error("Invalid role");
        }
        roleDoc.name = name;
        roleDoc.permissions = permissions;
        await roleDoc.save();
        return roleDoc;
    } catch (err) {
        console.error("Error editing role:", err);
        throw new Error("Failed to edit role");
    }
}

async function deleteUser(userId: string) {
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

async function deleteRole(id: string) {
    try {
        const role = await Role.findByIdAndDelete(id);
        if (!role) {
            throw new Error("Role not found");
        }

        const nauRole = await Role.findOne({ name: "NAU" });
        if (!nauRole) {
            throw new Error("NAU role not found");
        }

        await User.updateMany({ role: id }, { role: nauRole._id });

        return role;
    } catch (err) {
        console.error("Error deleting Role:", err);
        throw new Error("Failed to delete Role");
    }
}

export { getGoogleAuthURL, processGoogleAuth, getAuthenticatedUser, refreshAccessToken, notifyAdminToAddUser, addUser, addRole, editUserRole, deleteUser ,editRole,deleteRole};

