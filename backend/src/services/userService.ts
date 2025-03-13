import User from "../models/User";
import Role from "../models/Role";
import nodemailer from "nodemailer";
import mongoose from 'mongoose';
import { newUserAccessRequestTemplate, welcomeUserTemplate } from "../utils/emailTemplate";

interface RoleDocument extends Document {
    name: string;
    permissions: string[];
}

const SMTP_HOST = process.env.SMTP_HOST;
const SMTP_PORT = parseInt(process.env.SMTP_PORT!);
const SMTP_USER = process.env.SMTP_USER;
const SMTP_PASS = process.env.SMTP_PASS;
const FRONTEND_URL = process.env.FRONTEND_URL;

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
            to: process.env.ADMIN_EMAIL,
            ...newUserAccessRequestTemplate(userInfo),
        };

        await transporter.sendMail(mailOptions);
        console.log(`Notification sent to admin for user: ${userInfo.email}`);
    } catch (err) {
        console.error("Error notifying admin:", err);
        throw new Error("Failed to notify admin");
    }
}

async function sendWelcomeEmail(user: { email: string }) {
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

        const loginUrl = `${FRONTEND_URL}/login`; 
        const emailTemplate = welcomeUserTemplate({ email: user.email }, loginUrl);

        const mailOptions = {
            from: `"CloudCapture" <${process.env.SMTP_USER}>`,
            to: user.email,
            subject: emailTemplate.subject,
            text: emailTemplate.text,
            html: emailTemplate.html,
        };

        await transporter.sendMail(mailOptions);
        console.log(`Welcome email sent to ${user.email}`);
    } catch (err) {
        console.error("Error sending welcome email:", err);
    }
}

async function addUser(email: string, role: string) {
    try {
        const roleDoc = await Role.findById(role);
        if (!roleDoc) {
            throw new Error("Invalid role");
        }
        const user = new User({ email, role: roleDoc._id });
        await user.save();

        await sendWelcomeEmail(user);

        return user;
    } catch (err) {
        console.error("Error adding user:", err);
        throw new Error("Failed to add user");
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

export { notifyAdminToAddUser, sendWelcomeEmail, addUser, getAuthenticatedUser, deleteUser, editUserRole };
