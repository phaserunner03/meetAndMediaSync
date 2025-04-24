import { Request, Response } from "express";
import * as roleService from "../services/roleService";
import { StatusCodes } from "../constants/status-codes.constants";
import {
  ErrorResponseMessages,
  SuccessResponseMessages,
} from "../constants/service-messages.constants";
import logger from "../utils/logger";
import permissionsConfig from "../config/permission.json";
// Extend the Request interface to include the user property
export interface AuthenticatedRequest extends Request {
  user?: {
    googleId: string;
    role: {
      _id: string;
      name: string;
      permissions: string[];
    };
  };
}

const functionName = {
  addRole: "addRole",
  editRole: "editRole",
  deleteRole: "deleteRole",
  getAllRoles: "getAllRoles",
  getBelowRoles: "getBelowRoles",
};

// Add a new role
async function addRole(req: AuthenticatedRequest, res: Response) {
  try {
    const { name, permissions } = req.body;

    if (!name || !permissions) {
      logger.warn({
        functionName: functionName.addRole,
        statusCode: StatusCodes.BAD_REQUEST,
        message: "Role name and permissions are required",
        data: {},
      });
      return res.status(StatusCodes.BAD_REQUEST).json({
        success: false,
        message: ErrorResponseMessages.BAD_REQUEST(
          "Role name and permissions are required"
        ),
        data: {},
      });
    }

    const role = await roleService.addRole(name, permissions, req.user?.role.permissions || []);
    logger.info({
      functionName: functionName.addRole,
      statusCode: StatusCodes.CREATED,
      message: "Role added successfully",
      data: { role },
    });
    res.status(StatusCodes.CREATED).json({
      success: true,
      message: SuccessResponseMessages.CREATED("Role"),
      data: { role },
    });
  } catch (err) {
    logger.error({
      functionName: functionName.addRole,
      statusCode: StatusCodes.INTERNAL_SERVER_ERROR,
      message: "Error adding role",
      data: { error: (err as Error).message },
    });
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
        logger.warn({
            functionName: functionName.editRole,
            statusCode: StatusCodes.BAD_REQUEST,
            message: "Role ID is required",
            data: {},
        });
      return res.status(StatusCodes.BAD_REQUEST).json({
        success: false,
        message: ErrorResponseMessages.BAD_REQUEST("Role ID is required"),
        data: {},
      });
    }

    if (!name && !permissions) {
        logger.warn({
            functionName: functionName.editRole,
            statusCode: StatusCodes.BAD_REQUEST,
            message: "At least one field (name or permissions) must be updated",
            data: {},
        });
      return res.status(StatusCodes.BAD_REQUEST).json({
        success: false,
        message: ErrorResponseMessages.BAD_REQUEST(
          "At least one field (name or permissions) must be updated"
        ),
        data: {},
      });
    }

    const role = await roleService.editRole(id, name, permissions, req.user?.role.permissions || []);
    logger.info({
      functionName: functionName.editRole,
      statusCode: StatusCodes.OK,
      message: "Role edited successfully",
      data: { role },
    });
    res.status(StatusCodes.OK).json({
      success: true,
      message: SuccessResponseMessages.UPDATED("Role"),
      data: { role },
    });
  } catch (err) {
    logger.error({
      functionName: functionName.editRole,
      statusCode: StatusCodes.INTERNAL_SERVER_ERROR,
      message: "Error editing role",
      data: { error: (err as Error).message },
    });
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
        logger.warn({
            functionName: functionName.deleteRole,
            statusCode: StatusCodes.BAD_REQUEST,
            message: "Role ID is required",
            data: {},
        });
      return res.status(StatusCodes.BAD_REQUEST).json({
        success: false,
        message: ErrorResponseMessages.BAD_REQUEST("Role ID is required"),
        data: {},
      });
    }

    await roleService.deleteRole(id);
    logger.info({
      functionName: functionName.deleteRole,
      statusCode: StatusCodes.OK,
      message: "Role deleted successfully",
      data: {},
    });
    res.status(StatusCodes.OK).json({
      success: true,
      message: SuccessResponseMessages.DELETED("Role"),
      data: {},
    });
  } catch (err) {

    logger.error({
      functionName: functionName.deleteRole,
      statusCode: StatusCodes.INTERNAL_SERVER_ERROR,
      message: "Error deleting role",
      data: { error: (err as Error).message },
    });
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
    if (!roles || roles.length === 0) {
        logger.warn({
            functionName: functionName.getAllRoles,
            statusCode: StatusCodes.NOT_FOUND,
            message: "No roles found",
            data: {},
        });
      return res.status(StatusCodes.NOT_FOUND).json({
        success: false,
        message: ErrorResponseMessages.NOT_FOUND("Roles"),
        data: {},
      });
    }
    logger.info({
      functionName: functionName.getAllRoles,
      statusCode: StatusCodes.OK,
      message: "Roles fetched successfully",
      data: { roleCount: roles.length },
    });

    res.status(StatusCodes.OK).json({
      success: true,
      message: SuccessResponseMessages.FETCHED("Roles"),
      data: { roles },
    });
  } catch (err) {

    logger.error({
      functionName: functionName.getAllRoles,
      statusCode: StatusCodes.INTERNAL_SERVER_ERROR,
      message: "Error fetching roles",
      data: { error: (err as Error).message },
    });
    res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
      success: false,
      message: ErrorResponseMessages.INTERNAL_ERROR,
      data: { error: (err as Error).message },
    });
  }
}


async function getBelowRoles(req: AuthenticatedRequest, res: Response) {
  try {
    const userPermissions = req.user?.role.permissions || [];
    const roles = await roleService.getAllRoles();

    const userMaxLevel = Math.max(
      ...userPermissions.map((permission) =>
        roleService.getPermissionLevel(permission)
      )
    );

    const filteredRoles = roles.filter((role: any) =>
      role.permissions.every(
        (permission: string) =>
          roleService.getPermissionLevel(permission) <= userMaxLevel
      )
    );

    if (!filteredRoles || filteredRoles.length === 0) {
      logger.warn({
        functionName: functionName.getBelowRoles,
        statusCode: StatusCodes.NOT_FOUND,
        message: "No roles found",
        data: {},
      });
      return res.status(StatusCodes.NOT_FOUND).json({
        success: false,
        message: ErrorResponseMessages.NOT_FOUND("Roles"),
        data: {},
      });
    }

    logger.info({
      functionName: functionName.getBelowRoles,
      statusCode: StatusCodes.OK,
      message: "Roles fetched successfully",
      data: { roleCount: filteredRoles.length },
    });

    res.status(StatusCodes.OK).json({
      success: true,
      message: SuccessResponseMessages.FETCHED("Roles"),
      data: { roles: filteredRoles },
    });
  } catch (err) {
    logger.error({
      functionName: functionName.getBelowRoles,
      statusCode: StatusCodes.INTERNAL_SERVER_ERROR,
      message: "Error fetching roles",
      data: { error: (err as Error).message },
    });
    res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
      success: false,
      message: ErrorResponseMessages.INTERNAL_ERROR,
      data: { error: (err as Error).message },
    });
  }
}



export { addRole, editRole, deleteRole, getAllRoles, getBelowRoles };
