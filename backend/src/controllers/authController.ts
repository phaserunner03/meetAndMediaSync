import dotenv from "dotenv";
dotenv.config();
import { Request, Response } from 'express';
import * as authService from "../services/authService";
import jwt from "jsonwebtoken";
import User from "../models/User";
import Role from "../models/Role";

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
                        const newToken = await authService.refreshAccessToken(refreshToken);
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
        res.status(500).json({ message: "Failed to authenticate", error: (err as Error).message });
    }
}

async function handleGoogleCallback(req: Request, res: Response) {
    try {
        const { code } = req.query;
        if (!code) {
            return res.status(400).json({ success: false, message: "Authorization code is missing" });
        }

        const result = await authService.processGoogleAuth(code as string);

        if (!result.success) {
            return res.status(401).json({ success: false, message: result.message });
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
        res.status(401).json({ success: false, message: (err as Error).message });
    }
}

async function notifyAdmin(req: Request, res: Response) {
    try {
        const { email,name } = req.body;
        await authService.notifyAdminToAddUser({ email ,name});
        res.json({ success: true, message: "Admin notified successfully" });
    } catch (err) {
        res.status(500).json({ success: false, message: (err as Error).message });
    }
}

async function getUser(req: AuthenticatedRequest, res: Response) {
    try {
        const user = await authService.getAuthenticatedUser(req.user.googleId);
        res.json({ success: true, user });
    } catch (err) {
        res.status(500).json({ success: false, message: (err as Error).message });
    }
}

async function logoutUser(req: Request, res: Response) {
    res.clearCookie("token", { httpOnly: true, secure: process.env.NODE_ENV === "production", sameSite: process.env.NODE_ENV === "production" ? "strict" : "lax"});
    res.json({ success: true, message: "Logged out successfully" });
}

async function refreshAccessToken(req: Request, res: Response) {
    try {
        const { refreshToken } = req.cookies;
        if (!refreshToken) {
            return res.status(400).json({ success: false, message: "Refresh token is missing" });
        }

        const newToken = await authService.refreshAccessToken(refreshToken);

        res.cookie("token", newToken, {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            sameSite: process.env.NODE_ENV === "production" ? "strict" : "lax",
            maxAge: 7 * 24 * 60 * 60 * 1000,
        });

        res.json({ success: true, token: newToken });
    } catch (err) {
        res.status(401).json({ success: false, message: (err as Error).message });
    }
}

async function addUser(req: AuthenticatedRequest, res: Response) {
    try {
        const { email, role } = req.body;
        const user = await authService.addUser(email, role);
        res.status(201).json({ success: true, user });
    } catch (err) {
        res.status(400).json({ success: false, message: (err as Error).message });
    }
}

async function addRole(req: AuthenticatedRequest, res: Response) {
    try {
        const { name, permissions } = req.body;
        const role = await authService.addRole(name, permissions);
        res.status(201).json({ success: true, role });
    } catch (err) {
        res.status(400).json({ success: false, message: (err as Error).message });
    }
}

async function editUserRole(req: AuthenticatedRequest, res: Response) {
    try {
        const { userId, newRole } = req.body;
        const user = await authService.editUserRole(userId, newRole);
        res.status(200).json({ success: true, user });
    } catch (err) {
        res.status(400).json({ success: false, message: (err as Error).message });
    }
}

async function editRole(req: AuthenticatedRequest, res: Response) {
    try {
        const { id }=req.params;
        const { name, permissions } = req.body;
        const role = await authService.editRole(id, name, permissions);
        
        res.status(200).json({ success: true, role });
    } catch (err) {
        res.status(400).json({ success: false, message: (err as Error).message });
    }
}

async function deleteUser(req: AuthenticatedRequest, res: Response) {
    try {
        const { userId } = req.params;
        await authService.deleteUser(userId);
        res.status(200).json({ success: true, message: "User deleted successfully" });
    } catch (err) {
        res.status(400).json({ success: false, message: (err as Error).message });
    }
}

async function deleteRole(req: AuthenticatedRequest, res: Response) {
    try {
        const { id } = req.params;
        await authService.deleteRole(id);
        res.status(200).json({ success: true, message: "User deleted successfully" });
    } catch (err) {
        res.status(400).json({ success: false, message: (err as Error).message });
    }
}

async function getAllUsers(req: AuthenticatedRequest, res: Response) {
    try {
        const users = await User.find().populate('role', 'name permissions');
        res.status(200).json({ success: true, users });
    } catch (err) {
        res.status(500).json({ success: false, message: (err as Error).message });
    }
}

async function getAllRoles(req: AuthenticatedRequest, res: Response) {
    try {
        const roles = await Role.find();
        res.status(200).json({ success: true, roles });
    } catch (err) {
        res.status(500).json({ success: false, message: (err as Error).message });
    }
}

export { redirectToGoogle, handleGoogleCallback, getUser, logoutUser, refreshAccessToken, addUser, addRole, notifyAdmin, editUserRole, deleteUser, getAllUsers, getAllRoles ,editRole,deleteRole};

