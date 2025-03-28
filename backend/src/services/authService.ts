import { google } from "googleapis";
import { notifyAdminToAddUser } from "./userService";
import jwt from "jsonwebtoken";
import mongoose, { Document } from 'mongoose';
import { GoogleGCPScopes } from "../constants/scopes.constants";
import { Collections } from "../constants/collections.constants";
import { UserDocument } from "../constants/types.constants";
import { secretVariables } from "../constants/environments.constants";


const SECRET_KEY = secretVariables.SECRET_KEY ?? "default_secret_key";
const CLIENT_ID = secretVariables.GOOGLE_CLIENT_ID;
const CLIENT_SECRET = secretVariables.GOOGLE_CLIENT_SECRET ;
const REDIRECT_URI = secretVariables.GOOGLE_REDIRECT_URI;

const oauth2Client = new google.auth.OAuth2(CLIENT_ID, CLIENT_SECRET, REDIRECT_URI);

function getGoogleAuthURL(): string {
    try {
        return oauth2Client.generateAuthUrl({
            access_type: "offline",
            prompt: "consent",
            scope: [
                GoogleGCPScopes.PROFILE,
                GoogleGCPScopes.EMAIL,
                GoogleGCPScopes.CALENDAR,
                GoogleGCPScopes.DRIVE
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

        let user = await Collections.USER.findOne({ email: data.email });
        if (!user) {
            let role=await Collections.ROLE.findOne({name:"NAU"});
            user = new Collections.USER({
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

async function refreshJwtToken(refreshToken: string) {
    try {
        const user = await Collections.USER.findOne({ refreshToken });
        if (!user) throw new Error("User not found");

        const newToken = jwt.sign(
            { uid: user.googleId, email: user.email },
            secretVariables.SECRET_KEY,
            { expiresIn: "7d" }
        );

        return newToken;
    } catch (err) {
        console.error("Error refreshing access token:", err);
        throw new Error("Failed to refresh access token");
    }
}

export { getGoogleAuthURL, processGoogleAuth, refreshJwtToken };

