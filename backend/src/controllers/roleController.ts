import { Request, Response } from 'express';
import * as roleService from "../services/roleService";
import { StatusCodes } from '../constants/status-codes.constants';

// Extend the Request interface to include the user property
export interface AuthenticatedRequest extends Request {
    user: {
        googleId: string;
    };
}

async function addRole(req: AuthenticatedRequest, res: Response) {
    try {
        const { name, permissions } = req.body;
        const role = await roleService.addRole(name, permissions);
        res.status(StatusCodes.CREATED).json({ success: true, message: "Role added successfully", data: { role } });
    } catch (err) {
        res.status(StatusCodes.BAD_REQUEST).json({ success: false, message: (err as Error).message, data: {} });
    }
}

async function editRole(req: AuthenticatedRequest, res: Response) {
    try {
        const { id } = req.params;
        const { name, permissions } = req.body;
        const role = await roleService.editRole(id, name, permissions);
        
        res.status(StatusCodes.OK).json({ success: true, message: "Role edited successfully", data: { role } });
    } catch (err) {
        res.status(StatusCodes.BAD_REQUEST).json({ success: false, message: (err as Error).message, data: {} });
    }
}

async function deleteRole(req: AuthenticatedRequest, res: Response) {
    try {
        const { id } = req.params;
        await roleService.deleteRole(id);
        res.status(StatusCodes.OK).json({ success: true, message: "Role deleted successfully", data: {} });
    } catch (err) {
        res.status(StatusCodes.BAD_REQUEST).json({ success: false, message: (err as Error).message, data: {} });
    }
}

async function getAllRoles(req: AuthenticatedRequest, res: Response) {
    try {
        const roles = await roleService.getAllRoles();
        res.status(StatusCodes.OK).json({ success: true, message: "Roles fetched successfully", data: { roles } });
    } catch (err) {
        res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ success: false, message: (err as Error).message, data: {} });
    }
}

export { addRole, editRole, deleteRole, getAllRoles };
