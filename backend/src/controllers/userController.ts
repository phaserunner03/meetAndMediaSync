import { Request, Response } from 'express';
import * as userService from "../services/userService";
import { Collections } from '../constants/collections.constants';
import { StatusCodes } from '../constants/status-codes.constants';
import { SuccessResponseMessages, ErrorResponseMessages } from '../constants/service-messages.constants';

export interface AuthenticatedRequest extends Request {
    user: {
        googleId: string;
    };
}

async function getUser(req: AuthenticatedRequest, res: Response) {
    try {
        const user = await userService.getAuthenticatedUser(req.user.googleId);
        if (!user) {
            return res.status(StatusCodes.NOT_FOUND).json({ success: false, message: ErrorResponseMessages.NOT_FOUND("User"), data: {} });
        }
        res.status(StatusCodes.OK).json({ success: true, message: SuccessResponseMessages.FETCHED("User"), data: { user } });
    } catch (err) {
        res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ success: false, message: ErrorResponseMessages.INTERNAL_ERROR, data: { error: (err as Error).message } });
    }
}

async function addUser(req: AuthenticatedRequest, res: Response) {
    try {
        const { email, role } = req.body;
        const user = await userService.addUser(email, role);
        if (!user) {
            return res.status(StatusCodes.BAD_REQUEST).json({ success: false, message: ErrorResponseMessages.CREATED_FAILED("User"), data: {} });
        }
        res.status(StatusCodes.CREATED).json({ success: true, message: SuccessResponseMessages.CREATED("User"), data: { user } });
    } catch (err) {
        res.status(StatusCodes.BAD_REQUEST).json({ success: false, message: ErrorResponseMessages.INTERNAL_ERROR, data: { error: (err as Error).message } });
    }
}

async function deleteUser(req: AuthenticatedRequest, res: Response) {
    try {
        const { userId } = req.params;
        const result = await userService.deleteUser(userId);
        if (!result) {
            return res.status(StatusCodes.BAD_REQUEST).json({ success: false, message: ErrorResponseMessages.DELETION_FAILED("User"), data: {} });
        }
        res.status(StatusCodes.OK).json({ success: true, message: SuccessResponseMessages.DELETED("User"), data: {} });
    } catch (err) {
        res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ success: false, message: ErrorResponseMessages.INTERNAL_ERROR, data: { error: (err as Error).message } });
    }
}

async function getAllUsers(req: AuthenticatedRequest, res: Response) {
    try {
        const users = await Collections.USER.find().populate('role', 'name permissions');
        if (!users || users.length === 0) {
            return res.status(StatusCodes.NOT_FOUND).json({ success: false, message: ErrorResponseMessages.NOT_FOUND("Users"), data: {} });
        }
        res.status(StatusCodes.OK).json({ success: true, message: SuccessResponseMessages.FETCHED("User"), data: { users } });
    } catch (err) {
        res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ success: false, message: ErrorResponseMessages.INTERNAL_ERROR, data: { error: (err as Error).message } });
    }
}

async function editUserRole(req: AuthenticatedRequest, res: Response) {
    try {
        const { userId, newRole } = req.body;
        const user = await userService.editUserRole(userId, newRole);
        if (!user) {
            return res.status(StatusCodes.BAD_REQUEST).json({ success: false, message: ErrorResponseMessages.UPDATED_FAILED("User"), data: {} });
        }
        res.status(StatusCodes.OK).json({ success: true, message: SuccessResponseMessages.UPDATED("User"), data: { user } });
    } catch (err) {
        res.status(StatusCodes.BAD_REQUEST).json({ success: false, message: ErrorResponseMessages.INTERNAL_ERROR, data: { error: (err as Error).message } });
    }
}

async function notifyAdmin(req: Request, res: Response) {
    try {
        const { email, name } = req.body;
        const result = await userService.notifyAdminToAddUser({ email, name });
        if (result === undefined || result === null) {
            return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ success: false, message: ErrorResponseMessages.NOTIFICATION_FAILED });
        }
        res.status(StatusCodes.OK).json({ success: true, message: SuccessResponseMessages.NOTIFIED });
    } catch (err) {
        res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ success: false, message: ErrorResponseMessages.INTERNAL_ERROR });
    }
}

export { getUser, addUser, deleteUser, getAllUsers, notifyAdmin, editUserRole };
