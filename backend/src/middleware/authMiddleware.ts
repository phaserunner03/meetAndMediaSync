import jwt from "jsonwebtoken";
import { Request, Response, NextFunction } from "express";
import { Collections } from "../constants/collections.constants";
import { StatusCodes } from "../constants/status-codes.constants";
import { ErrorResponseMessages } from "../constants/service-messages.constants";
import { secretVariables } from "../constants/environments.constants";
import logger from "../utils/logger";

interface AuthRequest extends Request {
  user?: any;
  token?: string;
}

const functionName = {
  authMiddleware: "authMiddleware",
  restrictTo: "restrictTo",
};

function extractToken(req: AuthRequest): string | null {
  return req.header("authToken") ?? req.cookies?.token ?? null;
}

const authMiddleware = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const token = extractToken(req);
    if (!token) {
      logger.warn({
        functionName: functionName.authMiddleware,
        statusCode: StatusCodes.UNAUTHORIZED,
        message: "Unauthorized access - No token provided",
      });
      return res.status(StatusCodes.UNAUTHORIZED).json({
        success: false,
        message: ErrorResponseMessages.UNAUTHORIZED("No token provided"),
      });
    }

    const decoded = jwt.verify(token, secretVariables.SECRET_KEY) as {
      uid: string;
    };
    const user = await Collections.USER.findOne({
      googleId: decoded.uid,
    }).populate("role");

    if (!user) {
      logger.warn({
        functionName: functionName.authMiddleware,
        statusCode: StatusCodes.UNAUTHORIZED,
        message: "Unauthorized access - User not found",
        data: { uid: decoded.uid },
      });
      return res.status(StatusCodes.UNAUTHORIZED).json({
        success: false,
        message: ErrorResponseMessages.UNAUTHORIZED("User not found"),
      });
    }

    req.user = user;
    req.token = token;

    logger.info({
      functionName: functionName.authMiddleware,
      statusCode: StatusCodes.OK,
      message: "User authenticated successfully",
      data: { email: user.email, userId: user._id },
    });

    next();
  } catch (error) {
    logger.error({
      functionName: functionName.authMiddleware,
      statusCode: StatusCodes.UNAUTHORIZED,
      message: "Authentication failed - Invalid or expired token",
      data: { error: error instanceof Error ? error.message : "Unknown error" },
    });

    return res.status(StatusCodes.UNAUTHORIZED).json({
      success: false,
      message: ErrorResponseMessages.UNAUTHORIZED("Invalid or expired token"),
    });
  }
};

const restrictTo = (requiredPermission: string) => {
  return (req: AuthRequest, res: Response, next: NextFunction) => {
    if (!req.user?.role?.permissions.includes(requiredPermission)) {
      logger.warn({
        functionName: functionName.restrictTo,
        statusCode: StatusCodes.FORBIDDEN,
        message: "Access denied - Insufficient permissions",
        data: { email: req.user.email, requiredPermission },
      });
      return res.status(StatusCodes.FORBIDDEN).json({
        success: false,
        message: ErrorResponseMessages.FORBIDDEN("Insufficient permissions"),
      });
    }

    logger.info({
      functionName: functionName.restrictTo,
      statusCode: StatusCodes.OK,
      message: "Access granted",
      data: { email: req.user.email, requiredPermission },
    });

    next();
  };
};

export { authMiddleware, restrictTo };
