import dotenv from "dotenv";
dotenv.config();
import { Request, Response } from "express";
import * as authService from "../services/authService";
import jwt from "jsonwebtoken";
import { Collections } from "../constants/collections.constants";
import { StatusCodes } from "../constants/status-codes.constants";
import {
  environment,
  secretVariables,
} from "../constants/environments.constants";
import {
  ErrorResponseMessages,
  SuccessResponseMessages,
} from "../constants/service-messages.constants";
import logger from "../utils/logger";
import { AuthenticatedRequest } from "../constants/types.constants";

const functionName = {
  redirectToGoogle: "redirectToGoogle",
  handleToken: "handleToken",
  handleRefreshToken: "handleRefreshToken",
  handleNoToken: "handleNoToken",
  handleGoogleCallback: "handleGoogleCallback",
  logoutUser: "logoutUser",
  refreshJwtToken: "refreshJwtToken",
};

// export interface AuthenticatedRequest extends Request {
//   user: {
//     googleId: string;
//     email: string;
//     refreshToken: string;
//   };
// }

async function redirectToGoogle(req: Request, res: Response) {
  try {
    const token = req.cookies.token;

    if (token) {
      await handleToken(token, req, res);
    } else {
      await handleNoToken(req, res);
    }
  } catch (error) {
    logger.error({
      functionName: functionName.redirectToGoogle,
      statusCode: StatusCodes.INTERNAL_SERVER_ERROR,
      message: "Error in redirectToGoogle",
      data: { error: (error as Error).message },
    });

    res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
      success: false,
      message: ErrorResponseMessages.INTERNAL_ERROR,
      data: {},
    });
  }
}

async function handleToken(token: string, req: Request, res: Response) {
  try {
    const decoded = jwt.verify(token, secretVariables.SECRET_KEY);
    const user = await Collections.USER.findOne({
      googleId: (decoded as any).uid,
    });

    if (!user) throw new Error(ErrorResponseMessages.NOT_FOUND("User"));

    logger.info({
      functionName: functionName.handleToken,
      statusCode: StatusCodes.OK,
      message: "User authenticated successfully",
      data: { email: user.email },
    });

    return res.redirect(`${environment.FRONTEND_URL}/dashboard/home`);
  } catch (err) {
    console.log("JWT expired or invalid. Trying refresh token...");
    await handleRefreshToken(req, res);
  }
}

async function handleRefreshToken(req: Request, res: Response) {
  const { refreshToken } = req.cookies;
  if (refreshToken) {
    try {
      const user = await Collections.USER.findOne({ refreshToken });
      if (!user) throw new Error(ErrorResponseMessages.NOT_FOUND("User"));

      const newToken = jwt.sign(
        { uid: user.googleId, email: user.email },
        secretVariables.SECRET_KEY,
        { expiresIn: "7d" }
      );

      res.cookie("token", newToken, {
        httpOnly: true,
        secure: environment.NODE_ENV === "production", // Change for localhost testing
        sameSite: environment.NODE_ENV === "production" ? "none" : "lax", // Cross-origin requests need "lax" or "none"
        maxAge: 7 * 24 * 60 * 60 * 1000,
      });

      logger.info({
        functionName: functionName.handleRefreshToken,
        statusCode: StatusCodes.OK,
        message: "Access token refreshed successfully",
        data: { email: user.email },
      });

      return res.redirect(`${environment.FRONTEND_URL}/dashboard/home`);
    } catch (error) {
      logger.error({
        functionName: functionName.handleRefreshToken,
        statusCode: StatusCodes.UNAUTHORIZED,
        message: "Error refreshing access token",
        data: { error: (error as Error).message },
      });
    }
  }
}

async function handleNoToken(req: Request, res: Response) {
  logger.info({
    functionName: functionName.handleNoToken,
    statusCode: StatusCodes.OK,
    message: "No valid session. Redirecting to Google OAuth",
    data: {},
  });
  const url = authService.getGoogleAuthURL();
  res.redirect(url);
}

async function handleGoogleCallback(req: Request, res: Response) {
  try {
    const { code } = req.query;
    if (!code) {
      logger.warn({
        functionName: functionName.handleGoogleCallback,
        statusCode: StatusCodes.BAD_REQUEST,
        message: "Missing authorization code",
        data: {},
      });
      return res.status(StatusCodes.BAD_REQUEST).json({
        success: false,
        message: ErrorResponseMessages.BAD_REQUEST(),
        data: {},
      });
    }

    const result = await authService.processGoogleAuth(code as string);

    if (!result.success) {
      return res.status(StatusCodes.UNAUTHORIZED).json({
        success: false,
        message: ErrorResponseMessages.UNAUTHORIZED,
        data: {},
      });
    }
    if (
      result.success &&
      result.message === "You are not authorized to access this website"
    ) {
      return res.redirect(`${environment.FRONTEND_URL}/unauthorized`);
    }
    if (result.token) {
      res.cookie("token", result.token, {
        httpOnly: true,
        secure: environment.NODE_ENV === "production", // Change for localhost testing
        sameSite: environment.NODE_ENV === "production" ? "none" : "lax", // Cross-origin requests need "lax" or "none"
        maxAge: 7 * 24 * 60 * 60 * 1000,
      });
    }

    if (result.refresh_token) {
      res.cookie("refreshToken", result.refresh_token, {
        httpOnly: true,
        secure: environment.NODE_ENV === "production", // Change for localhost testing
        sameSite: environment.NODE_ENV === "production" ? "none" : "lax", // Cross-origin requests need "lax" or "none"
        maxAge: 30 * 24 * 60 * 60 * 1000,
      });
    }
    logger.info({
      functionName: functionName.handleGoogleCallback,
      statusCode: StatusCodes.OK,
      message: "Google authentication successful",
      data: { },
    });

    res.redirect(`${environment.FRONTEND_URL}/dashboard/home`);
  } catch (err) {
    logger.error({
      functionName: functionName.handleGoogleCallback,
      statusCode: StatusCodes.UNAUTHORIZED,
      message: "Google authentication failed",
      data: { error: (err as Error).message },
    });

    res.status(StatusCodes.UNAUTHORIZED).json({
      success: false,
      message: ErrorResponseMessages.INVALID_CREDENTIALS,
      data: {},
    });
  }
}

async function logoutUser(req: Request, res: Response) {
  res.clearCookie("token", {
    httpOnly: true,
    secure: environment.NODE_ENV === "production",
    sameSite: environment.NODE_ENV === "production" ? "none" : "lax",
  });
  res.clearCookie("refreshToken", {
    httpOnly: true,
    secure: environment.NODE_ENV === "production",
    sameSite: environment.NODE_ENV === "production" ? "none" : "lax",
  });

  logger.info({
    functionName: functionName.logoutUser,
    statusCode: StatusCodes.OK,
    message: "User logged out successfully",
    data: {},
  });

  res.json({
    success: true,
    message: SuccessResponseMessages.ACTION_SUCCESS("Logout"),
    data: {},
  });
}

async function refreshJwtToken(req: Request, res: Response) {
  try {
    const { refreshToken } = req.cookies;
    if (!refreshToken) {
      logger.warn({
        functionName,
        statusCode: StatusCodes.BAD_REQUEST,
        message: "Refresh token is missing",
        data: {},
      });

      return res.status(StatusCodes.BAD_REQUEST).json({
        success: false,
        message: ErrorResponseMessages.BAD_REQUEST("Refresh token is missing"),
        data: {},
      });
    }
    try {
      jwt.verify(refreshToken, secretVariables.SECRET_KEY);
      logger.info({
        functionName,
        statusCode: StatusCodes.OK,
        message: "Refresh token is valid",
        data: { valid: true },
      });
      return res.status(StatusCodes.OK).json({
        success: true,
        message: SuccessResponseMessages.ACTION_SUCCESS("Token verification"),
        data: { valid: true },
      });
    } catch (err) {
      logger.warn({
        functionName,
        statusCode: StatusCodes.UNAUTHORIZED,
        message: "Refresh token expired or invalid. Attempting to generate a new token...",
        data: {},
      });
     
    }

    const newToken = await authService.refreshJwtToken(refreshToken);

    res.cookie("token", newToken, {
      httpOnly: true,
      secure: environment.NODE_ENV === "production", // Change for localhost testing
      sameSite: environment.NODE_ENV === "production" ? "none" : "lax", // Cross-origin requests need "lax" or "none"
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    logger.info({
      functionName,
      statusCode: StatusCodes.OK,
      message: "JWT token refreshed successfully",
      data: { valid: false },
    });

    res.status(StatusCodes.OK).json({
      success: true,
      message: "Token refreshed successfully",
      data: { token: newToken, valid: false },
    });
  } catch (err) {
    logger.error({
      functionName,
      statusCode: StatusCodes.UNAUTHORIZED,
      message: "Failed to refresh JWT token",
      data: { error: (err as Error).message },
    });
    res.status(StatusCodes.UNAUTHORIZED).json({
      success: false,
      message: ErrorResponseMessages.UNAUTHORIZED,
      data: { valid: false },
    });
  }
}

export { redirectToGoogle, handleGoogleCallback, logoutUser, refreshJwtToken };
