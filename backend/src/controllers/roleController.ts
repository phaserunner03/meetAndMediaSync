import { Request, Response } from "express";
import * as roleService from "../services/roleService";
import { StatusCodes } from "../constants/status-codes.constants";
import { ErrorResponseMessages, SuccessResponseMessages } from "../constants/service-messages.constants";

// Extend the Request interface to include the user property
export interface AuthenticatedRequest extends Request {
    user?: {
        googleId: string;
    };
}

// Add a new role
async function addRole(req: AuthenticatedRequest, res: Response) {
    try {
        const { name, permissions } = req.body;

        if (!name || !permissions) {
            return res.status(StatusCodes.BAD_REQUEST).json({
                success: false,
                message: ErrorResponseMessages.BAD_REQUEST("Role name and permissions are required"),
                data: {},
            });
        }

        const role = await roleService.addRole(name, permissions);
        res.status(StatusCodes.CREATED).json({
            success: true,
            message: SuccessResponseMessages.CREATED("Role"),
            data: { role },
        });
    } catch (err) {
        console.error("Error adding role:", err);
        res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
            success: false,
            message: ErrorResponseMessages.INTERNAL_ERROR,
            data: { error: (err as Error).message },
        });
    }
}

// Edit an existing role
async function editRole(req: AuthenticatedRequest, res: Response) {
    try {
        const { id } = req.params;
        const { name, permissions } = req.body;

        if (!id) {
            return res.status(StatusCodes.BAD_REQUEST).json({
                success: false,
                message: ErrorResponseMessages.BAD_REQUEST("Role ID is required"),
                data: {},
            });
        }

        if (!name && !permissions) {
            return res.status(StatusCodes.BAD_REQUEST).json({
                success: false,
                message: ErrorResponseMessages.BAD_REQUEST("At least one field (name or permissions) must be updated"),
                data: {},
            });
        }

        const role = await roleService.editRole(id, name, permissions);
        res.status(StatusCodes.OK).json({
            success: true,
            message: SuccessResponseMessages.UPDATED("Role"),
            data: { role },
        });
    } catch (err) {
        console.error("Error editing role:", err);
        res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
            success: false,
            message: ErrorResponseMessages.INTERNAL_ERROR,
            data: { error: (err as Error).message },
        });
    }
}

// Delete a role
async function deleteRole(req: AuthenticatedRequest, res: Response) {
    try {
        const { id } = req.params;

        if (!id) {
            return res.status(StatusCodes.BAD_REQUEST).json({
                success: false,
                message: ErrorResponseMessages.BAD_REQUEST("Role ID is required"),
                data: {},
            });
        }

        await roleService.deleteRole(id);
        res.status(StatusCodes.OK).json({
            success: true,
            message: SuccessResponseMessages.DELETED("Role"),
            data: {},
        });
    } catch (err) {
        console.error("Error deleting role:", err);
        res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
            success: false,
            message: ErrorResponseMessages.INTERNAL_ERROR,
            data: { error: (err as Error).message },
        });
    }
}

// Get all roles
async function getAllRoles(req: AuthenticatedRequest, res: Response) {
    try {
        const roles = await roleService.getAllRoles();
        res.status(StatusCodes.OK).json({
            success: true,
            message: SuccessResponseMessages.FETCHED("Roles"),
            data: { roles },
        });
    } catch (err) {
        console.error("Error fetching roles:", err);
        res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
            success: false,
            message: ErrorResponseMessages.INTERNAL_ERROR,
            data: { error: (err as Error).message },
        });
    }
}

export { addRole, editRole, deleteRole, getAllRoles };
