import { Request, Response } from "express";
import * as userService from "../services/userService";
import { Collections } from "../constants/collections.constants";
import { StatusCodes } from "../constants/status-codes.constants";
import {
  SuccessResponseMessages,
  ErrorResponseMessages,
} from "../constants/service-messages.constants";
import logger from "../utils/logger";

const functionName = {
  getUser: "getUser",
  addUser: "addUser",//yup
  deleteUser: "deleteUser",
  getAllUsers: "getAllUsers",
  editUserRole: "editUserRole",//yup
  notifyAdmin: "notifyAdmin",//yup
};

export interface AuthenticatedRequest extends Request {
  user: {
    googleId: string;
    role: {
      _id: string;
      name: string;
      permissions: string[];
    };
  };
}

async function getUser(req: AuthenticatedRequest, res: Response) {
  try {
    const user = await userService.getAuthenticatedUser(req.user.googleId);
    if (!user) {
      logger.warn({
        functionName: functionName.getUser,
        statusCode: StatusCodes.NOT_FOUND,
        message: "User not found",
        userId: req.user.googleId,
      });

      return res.status(StatusCodes.NOT_FOUND).json({
        success: false,
        message: ErrorResponseMessages.NOT_FOUND("User"),
        data: {},
      });
    }

    logger.info({
      functionName: functionName.getUser,
      message: "User fetched successfully",
      userId: req.user.googleId,
    });

    res.status(StatusCodes.OK).json({
      success: true,
      message: SuccessResponseMessages.FETCHED("User"),
      data: { user },
    });
  } catch (err) {
    logger.error({
      functionName: functionName.getUser,
      statusCode: StatusCodes.INTERNAL_SERVER_ERROR,
      message: "Error fetching user",
      error: (err as Error).message,
    });
    res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
      success: false,
      message: ErrorResponseMessages.INTERNAL_ERROR,
      data: { error: (err as Error).message },
    });
  }
}

async function addUser(req: AuthenticatedRequest, res: Response) {
  try {
    const { email, role } = req.body;
    const userRoleId = req.user.role._id; // Assume roleId is part of the authenticated user object

    const user = await userService.addUser(email, role, userRoleId);
    if (!user) {
      logger.warn({
        functionName: functionName.addUser,
        statusCode: StatusCodes.BAD_REQUEST,
        message: "User creation failed",
        data: {},
      });
      return res.status(StatusCodes.BAD_REQUEST).json({
        success: false,
        message: ErrorResponseMessages.CREATED_FAILED("User"),
        data: {},
      });
    }
    logger.info({
      functionName: functionName.addUser,
      statusCode: StatusCodes.CREATED,
      message: "User created successfully",
      data: { user },
    });
    res.status(StatusCodes.CREATED).json({
      success: true,
      message: SuccessResponseMessages.CREATED("User"),
      data: { user },
    });
  } catch (err) {
    logger.error({
      functionName: functionName.addUser,
      statusCode: StatusCodes.INTERNAL_SERVER_ERROR,
      message: "Error adding user",
      data: { error: (err as Error).message },
    });
    res.status(StatusCodes.BAD_REQUEST).json({
      success: false,
      message: ErrorResponseMessages.INTERNAL_ERROR,
      data: { error: (err as Error).message },
    });
  }
}

async function deleteUser(req: AuthenticatedRequest, res: Response) {
  try {
    const { userId } = req.params;
    const result = await userService.deleteUser(userId);
    if (!result) {
      logger.warn({
        functionName: functionName.deleteUser,
        statusCode: StatusCodes.BAD_REQUEST,
        message: "User deletion failed",
        data: {},
      });
      return res.status(StatusCodes.BAD_REQUEST).json({
        success: false,
        message: ErrorResponseMessages.DELETION_FAILED("User"),
        data: {},
      });
    }
    logger.info({
      functionName: functionName.deleteUser,
      statusCode: StatusCodes.OK,
      message: "User deleted successfully",
      data: {},
    });
    res.status(StatusCodes.OK).json({
      success: true,
      message: SuccessResponseMessages.DELETED("User"),
      data: {},
    });
  } catch (err) {
    logger.error({
      functionName: functionName.deleteUser,
      statusCode: StatusCodes.INTERNAL_SERVER_ERROR,
      message: "Error deleting user",
      data: { error: (err as Error).message },
    });
    res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
      success: false,
      message: ErrorResponseMessages.INTERNAL_ERROR,
      data: { error: (err as Error).message },
    });
  }
}

async function getAllUsers(req: AuthenticatedRequest, res: Response) {
  try {
    const users = await Collections.USER.find()
      .populate("role", "name permissions")
      .lean();

    const filteredUsers = users.filter(
      (user: any) => user.role.name !== "Seed Role"
    );

    if (!filteredUsers || filteredUsers.length === 0) {
      logger.warn({
        functionName: functionName.getAllUsers,
        statusCode: StatusCodes.NOT_FOUND,
        message: "Users not found",
      });
      return res.status(StatusCodes.NOT_FOUND).json({
        success: false,
        message: ErrorResponseMessages.NOT_FOUND("Users"),
        data: {},
      });
    }

    logger.info({
      functionName: functionName.getAllUsers,
      statusCode: StatusCodes.OK,
      message: "Users fetched successfully",
      data: { userCount: filteredUsers.length },
    });

    res.status(StatusCodes.OK).json({
      success: true,
      message: SuccessResponseMessages.FETCHED("User"),
      data: { users: filteredUsers },
    });
  } catch (err) {
    logger.error({
      functionName: functionName.getAllUsers,
      statusCode: StatusCodes.INTERNAL_SERVER_ERROR,
      message: "Error fetching users",
      data: { error: (err as Error).message },
    });
    res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
      success: false,
      message: ErrorResponseMessages.INTERNAL_ERROR,
      data: { error: (err as Error).message },
    });
  }
}

async function getBelowUsers(req: AuthenticatedRequest, res: Response) {
}

async function editUserRole(req: AuthenticatedRequest, res: Response) {
  try {
    const { userId, newRole } = req.body;
    const user = await userService.editUserRole(userId, newRole,req.user.role._id);
    if (!user) {
      logger.warn({
        functionName: functionName.editUserRole,
        statusCode: StatusCodes.BAD_REQUEST,
        message: "User role update failed",
        data: {},
      });
      return res.status(StatusCodes.BAD_REQUEST).json({
        success: false,
        message: ErrorResponseMessages.UPDATED_FAILED("User"),
        data: {},
      });
    }
    logger.info({
      functionName: functionName.editUserRole,
      statusCode: StatusCodes.OK,
      message: "User role updated successfully",
      data: { user },
    });
    res.status(StatusCodes.OK).json({
      success: true,
      message: SuccessResponseMessages.UPDATED("User"),
      data: { user },
    });
  } catch (err) {
    logger.error({
      functionName: functionName.editUserRole,
      statusCode: StatusCodes.INTERNAL_SERVER_ERROR,
      message: "Error updating user role",
      data: { error: (err as Error).message },
    });
    res.status(StatusCodes.BAD_REQUEST).json({
      success: false,
      message: ErrorResponseMessages.INTERNAL_ERROR,
      data: { error: (err as Error).message },
    });
  }
}

async function notifyAdmin(req: Request, res: Response) {
  try {
    const { email, name } = req.body;
    const result = await userService.notifyAdminToAddUser({ email, name });
    if (result === undefined || result === null) {
      logger.warn({
        functionName: functionName.notifyAdmin,
        statusCode: StatusCodes.INTERNAL_SERVER_ERROR,
        message: "Notification failed",
      });
      return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
        success: false,
        message: ErrorResponseMessages.NOTIFICATION_FAILED,
      });
    }
    logger.info({
      functionName: functionName.notifyAdmin,
      statusCode: StatusCodes.OK,
      message: "Notification sent successfully",
    });
    res
      .status(StatusCodes.OK)
      .json({ success: true, message: SuccessResponseMessages.NOTIFIED });
  } catch (err) {
    logger.error({
      functionName: functionName.notifyAdmin,
      statusCode: StatusCodes.INTERNAL_SERVER_ERROR,
      message: "Error sending notification",
      data: { error: (err as Error).message },
    });
    res
      .status(StatusCodes.INTERNAL_SERVER_ERROR)
      .json({ success: false, message: ErrorResponseMessages.INTERNAL_ERROR });
  }
}

export { getUser, addUser, deleteUser, getAllUsers, notifyAdmin, editUserRole };
