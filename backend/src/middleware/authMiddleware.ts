import jwt from "jsonwebtoken";
import { Request, Response, NextFunction } from "express";
import { Collections } from "../constants/collections.constants";
import { StatusCodes } from "../constants/status-codes.constants";
import { ErrorResponseMessages } from "../constants/service-messages.constants";

interface AuthRequest extends Request {
    user?: any;
    token?: string;
}

const authMiddleware = async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
        let token = req.header("authToken") || req.cookies?.token;

        if (!token) {
            return res.status(StatusCodes.UNAUTHORIZED).json({
                success: false,
                message: ErrorResponseMessages.UNAUTHORIZED("No token provided"),
            });
        }

        const decoded = jwt.verify(token, process.env.SECRET_KEY as string) as { uid: string };

        const user = await Collections.USER.findOne({ googleId: decoded.uid }).populate("role");

        if (!user) {
            return res.status(StatusCodes.UNAUTHORIZED).json({
                success: false,
                message: ErrorResponseMessages.UNAUTHORIZED("User not found"),
            });
        }

        req.user = user;
        req.token = token;

        console.log(`🔹 Authenticated User: ${user.email} (Role: ${user.role?.name || "No Role"})`);

        next();
    } catch (error) {
        console.error("❌ Authentication Error:", error);

        return res.status(StatusCodes.UNAUTHORIZED).json({
            success: false,
            message: ErrorResponseMessages.UNAUTHORIZED("Invalid or expired token"),
        });
    }
};

const restrictTo = (requiredPermission: string) => {
    return (req: AuthRequest, res: Response, next: NextFunction) => {
        if (!req.user?.role?.permissions.includes(requiredPermission)) {
            return res.status(StatusCodes.FORBIDDEN).json({
                success: false,
                message: ErrorResponseMessages.FORBIDDEN("Insufficient permissions"),
            });
        }

        console.log(`🔹 Access Granted: ${req.user.email} has permission for ${requiredPermission}`);
        next();
    };
};

export { authMiddleware, restrictTo };
