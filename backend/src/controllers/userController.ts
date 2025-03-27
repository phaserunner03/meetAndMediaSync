import { Request, Response } from 'express';
import * as userService from "../services/userService";
import { Collections } from '../constants/collections.constants';
import { StatusCodes } from '../constants/status-codes.constants';

// Extend the Request interface to include the user property
export interface AuthenticatedRequest extends Request {
    user: {
        googleId: string;
    };
}

async function getUser(req: AuthenticatedRequest, res: Response) {
    try {
        const user = await userService.getAuthenticatedUser(req.user.googleId);
        res.status(StatusCodes.OK).json({ success: true, message: "User fetched successfully", data: { user } });
    } catch (err) {
        res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ success: false, message: (err as Error).message, data: {} });
    }
}

async function addUser(req: AuthenticatedRequest, res: Response) {
    try {
        const { email, role } = req.body;
        const user = await userService.addUser(email, role);
        res.status(StatusCodes.CREATED).json({ success: true, message: "User added successfully", data: { user } });
    } catch (err) {
        res.status(StatusCodes.BAD_REQUEST).json({ success: false, message: (err as Error).message, data: {} });
    }
}

async function deleteUser(req: AuthenticatedRequest, res: Response) {
    try {
        const { userId } = req.params;
        await userService.deleteUser(userId);
        res.status(StatusCodes.OK).json({ success: true, message: "User deleted successfully", data: {} });
    } catch (err) {
        res.status(StatusCodes.BAD_REQUEST).json({ success: false, message: (err as Error).message, data: {} });
    }
}

async function getAllUsers(req: AuthenticatedRequest, res: Response) {
    try {
        const users = await Collections.USER.find().populate('role', 'name permissions');
        res.status(StatusCodes.OK).json({ success: true, message: "Users fetched successfully", data: { users } });
    } catch (err) {
        res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ success: false, message: (err as Error).message, data: {} });
    }
}

async function editUserRole(req: AuthenticatedRequest, res: Response) {
    try {
        const { userId, newRole } = req.body;
        const user = await userService.editUserRole(userId, newRole);
        res.status(StatusCodes.OK).json({ success: true, message: "User role updated successfully", data: { user } });
    } catch (err) {
        res.status(StatusCodes.BAD_REQUEST).json({ success: false, message: (err as Error).message, data: {} });
    }
}

async function notifyAdmin(req: Request, res: Response) {
    try {
        const { email, name } = req.body;
        await userService.notifyAdminToAddUser({ email, name });
        res.status(StatusCodes.OK).json({ success: true, message: "Admin notified successfully" });
    } catch (err) {
        res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ success: false, message: (err as Error).message });
    }
}

export { getUser, addUser, deleteUser, getAllUsers, notifyAdmin, editUserRole };
