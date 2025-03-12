import dotenv from "dotenv";
dotenv.config();
import { Request, Response } from 'express';
import * as authService from "../services/authService";
import jwt from "jsonwebtoken";
import User from "../models/User";

// Extend the Request interface to include the user property
export interface AuthenticatedRequest extends Request {
    user: {
        googleId: string;
    };
}

async function redirectToGoogle(req: Request, res: Response) {
    try {
        const token = req.cookies.token;

        if (token) {
            try {
                const decoded = jwt.verify(token, process.env.SECRET_KEY!);
                
                const user = await User.findOne({ googleId: (decoded as any).uid });

                if (!user) throw new Error("User not found");

                return res.redirect(`${process.env.FRONTEND_URL}/dashboard`);
            } catch (err) {
                console.log("JWT expired or invalid. Trying refresh token...");
                const { refreshToken } = req.cookies;
                if (refreshToken) {
                    try {
                        const user = await User.findOne({ refreshToken });
                        if (!user) throw new Error("User not found");

                        const newToken = jwt.sign(
                            { uid: user.googleId, email: user.email },
                            process.env.SECRET_KEY!,
                            { expiresIn: "7d" }
                        );

                        res.cookie("token", newToken, {
                            httpOnly: true,
                            secure: process.env.NODE_ENV === "production",
                            sameSite: process.env.NODE_ENV === "production" ? "strict" : "lax",
                            maxAge: 7 * 24 * 60 * 60 * 1000,
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
        res.status(500).json({ success: false, message: "Failed to authenticate", data: { error: (err as Error).message } });
    }
}

async function handleGoogleCallback(req: Request, res: Response) {
    try {
        const { code } = req.query;
        if (!code) {
            return res.status(400).json({ success: false, message: "Authorization code is missing", data: {} });
        }

        const result = await authService.processGoogleAuth(code as string);

        if (!result.success) {
            return res.status(401).json({ success: false, message: result.message, data: {} });
        }
        if(result.success && result.message === "You are not authorized to access this website") {
            return res.redirect(`${process.env.FRONTEND_URL}/unauthorized`);
        }
        if (result.token) {
            res.cookie("token", result.token, {
                httpOnly: true,
                secure: process.env.NODE_ENV === "production",
                sameSite: process.env.NODE_ENV === "production" ? "strict" : "lax",
                maxAge: 7 * 24 * 60 * 60 * 1000,
            });
        }

        if (result.refresh_token) {
            res.cookie("refreshToken", result.refresh_token, {
                httpOnly: true,
                secure: process.env.NODE_ENV === "production",
                sameSite: process.env.NODE_ENV === "production" ? "strict" : "lax",
                maxAge: 30 * 24 * 60 * 60 * 1000,
            });
        }

        res.redirect(`${process.env.FRONTEND_URL}/dashboard`);
    } catch (err) {
        res.status(401).json({ success: false, message: (err as Error).message, data: {} });
    }
}

async function logoutUser(req: Request, res: Response) {
    res.clearCookie("token", { httpOnly: true, secure: process.env.NODE_ENV === "production", sameSite: process.env.NODE_ENV === "production" ? "strict" : "lax"});
    res.json({ success: true, message: "Logged out successfully", data: {} });
}

async function refreshJwtToken(req: Request, res: Response) {
    try {
        const { refreshToken } = req.cookies;
        if (!refreshToken) {
            return res.status(400).json({ success: false, message: "Refresh token is missing", data: {} });
        }

        try {
            const decoded = jwt.verify(refreshToken, process.env.SECRET_KEY!);
            return res.status(200).json({ success: true, message: "Token is still valid", data: { valid: true } });
        } catch (err) {
            console.log("Refresh token expired or invalid. Generating new token...");
        }

        const newToken = await authService.refreshJwtToken(refreshToken);

        res.cookie("token", newToken, {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            sameSite: process.env.NODE_ENV === "production" ? "strict" : "lax",
            maxAge: 7 * 24 * 60 * 60 * 1000,
        });

        res.status(200).json({ success: true, message: "Token refreshed successfully", data: { token: newToken, valid: false } });
    } catch (err) {
        res.status(401).json({ success: false, message: (err as Error).message, data: { valid: false } });
    }
}

export { redirectToGoogle, handleGoogleCallback, logoutUser, refreshJwtToken };

