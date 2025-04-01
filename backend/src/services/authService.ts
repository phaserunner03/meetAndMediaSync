import { google } from "googleapis";
import { notifyAdminToAddUser } from "./userService";
import jwt from "jsonwebtoken";
import { GoogleGCPScopes } from "../constants/scopes.constants";
import { Collections } from "../constants/collections.constants";
import { UserDocument } from "../constants/types.constants";
import { secretVariables } from "../constants/environments.constants";
import logger from "../utils/logger";
import { StatusCodes } from "../constants/status-codes.constants";

const functionName = {
  getGoogleAuthURL: "getGoogleAuthURL",
  processGoogleAuth: "processGoogleAuth",
  generateJWT:"generateJWT",
  refreshJwtToken:"refreshJwtToken"
};

const SECRET_KEY = secretVariables.SECRET_KEY ?? "default_secret_key";
const CLIENT_ID = secretVariables.GOOGLE_CLIENT_ID;
const CLIENT_SECRET = secretVariables.GOOGLE_CLIENT_SECRET;
const REDIRECT_URI = secretVariables.GOOGLE_REDIRECT_URI;
const oauth2Client = new google.auth.OAuth2(
  CLIENT_ID,
  CLIENT_SECRET,
  REDIRECT_URI
);

function getGoogleAuthURL(): string {
  try {
    const authUrl = oauth2Client.generateAuthUrl({
      access_type: "offline",
      prompt: "consent",
      scope: [
        GoogleGCPScopes.PROFILE,
        GoogleGCPScopes.EMAIL,
        GoogleGCPScopes.CALENDAR,
        GoogleGCPScopes.DRIVE,
      ],
    });

    logger.info({
      functionName: "getGoogleAuthURL",
      statusCode: StatusCodes.OK,
      message: "Generated Google authentication URL successfully",
      data: { authUrl },
    });

    return authUrl;
  } catch (error) {
    logger.error({
      functionName: "getGoogleAuthURL",
      statusCode: StatusCodes.INTERNAL_SERVER_ERROR,
      message: "Error generating Google Auth URL",
      data: { error: error instanceof Error ? error.message : "Unknown error" },
    });

    throw new Error("Failed to generate Google Auth URL");
  }
}

async function processGoogleAuth(code: string) {
  try {
    const { tokens } = await oauth2Client.getToken(code);
    oauth2Client.setCredentials(tokens);

    const oauth2 = google.oauth2({ version: "v2", auth: oauth2Client });
    const { data } = await oauth2.userinfo.get();

    let user = await Collections.USER.findOne({ email: data.email });
    if (!user) {
      let role = await Collections.ROLE.findOne({ name: "NAU" });
      user = new Collections.USER({
        email: data.email,
        role: role?._id,
        googleId: data.id,
        displayName: data.name,
        photoURL: data.picture,
        accessToken: tokens.access_token!,
        refreshToken: tokens.refresh_token ?? "",
      });
      await user.save();
      await notifyAdminToAddUser(data);
      logger.info({
        functionName: functionName.processGoogleAuth,
        statusCode: StatusCodes.OK,
        message: "New unauthorized user created",
        data: { email: data.email, userId: user._id },
      });
      return {
        success: true,
        message: "You are not authorized to access this website",
      };
    }

    if (!user.displayName) {
      user.displayName = data.name ?? "Unknown";
    }
    if (!user.photoURL) {
      user.photoURL = data.picture ?? "default_photo_url";
    }
    if (!user.googleId) {
      user.googleId = data.id ?? user.googleId;
    }
    user.accessToken = tokens.access_token!;
    user.refreshToken = tokens.refresh_token ?? user.refreshToken;

    await user.save();

    const jwtToken = generateJWT(user);
    const refresh_token = user.refreshToken;

    logger.info({
      functionName: functionName.processGoogleAuth,
      statusCode: StatusCodes.OK,
      message: "User authenticated successfully",
      data: { email: user.email, userId: user._id },
    });

    return { success: true, token: jwtToken, refresh_token };
  } catch (error) {
    logger.error({
      functionName: "processGoogleAuth",
      statusCode: StatusCodes.INTERNAL_SERVER_ERROR,
      message: "Error processing Google OAuth",
      data: { error: error instanceof Error ? error.message : "Unknown error" },
    });

    throw new Error("Authentication failed");
  }
}

function generateJWT(user: UserDocument): string {
  try {
    const token = jwt.sign(
        { uid: user.googleId, email: user.email },
        SECRET_KEY,
        { expiresIn: "7d" }
    );

    logger.info({
        functionName: functionName.generateJWT,
        statusCode: StatusCodes.OK,
        message: "JWT generated successfully",
        data: { email: user.email },
    });

    return token;
  } catch (error) {
    logger.error({
        functionName: functionName.generateJWT,
        statusCode: StatusCodes.INTERNAL_SERVER_ERROR,
        message: "Error generating JWT",
        data: { error: error instanceof Error ? error.message : "Unknown error" },
    });

    throw new Error("Failed to generate JWT");  }
}

async function refreshJwtToken(refreshToken: string) {
    try {
        const user = await Collections.USER.findOne({ refreshToken });

        if (!user) {
            logger.warn({
                functionName: functionName.refreshJwtToken,
                statusCode: StatusCodes.NOT_FOUND,
                message: "User not found for refresh token",
                data: { refreshToken },
            });

            throw new Error("User not found");
        }

        const newToken = jwt.sign(
            { uid: user.googleId, email: user.email },
            SECRET_KEY,
            { expiresIn: "7d" }
        );

        logger.info({
            functionName: "refreshJwtToken",
            statusCode: StatusCodes.OK,
            message: "JWT refreshed successfully",
            data: { email: user.email },
        });

        return newToken;
    } catch (error) {
        logger.error({
            functionName: functionName.refreshJwtToken,
            statusCode: StatusCodes.INTERNAL_SERVER_ERROR,
            message: "Error refreshing JWT",
            data: { error: error instanceof Error ? error.message : "Unknown error" },
        });

        throw new Error("Failed to refresh access token");
    }
}

export { getGoogleAuthURL, processGoogleAuth, refreshJwtToken };
