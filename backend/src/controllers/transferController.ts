import { Request, Response } from "express";
import { transferScreenshotsToGCP } from "../services/transferService";
import { StatusCodes } from "../constants/status-codes.constants";
import { ErrorResponseMessages, SuccessResponseMessages } from "../constants/service-messages.constants";
import { AuthenticatedRequest } from "../constants/types.constants";
import logger from "../utils/logger";

const functionName = "triggerTransfer";

async function triggerTransfer(req: AuthenticatedRequest, res: Response) {
    try {
        const { user } = req;

        if (!user?.refreshToken || !user?.email) {
            logger.warn({
                functionName,
                statusCode: StatusCodes.UNAUTHORIZED,
                message: "Unauthorized: Missing refresh token or email",
                data: { userId: user?.googleId },
            });
            return res.status(StatusCodes.UNAUTHORIZED).json({
                success: false,
                message: ErrorResponseMessages.UNAUTHORIZED,
            });
        }
        logger.info({
            functionName,
            statusCode: StatusCodes.OK,
            message: `Starting screenshot transfer for ${user.email}`,
            data: { userId: user.googleId, email: user.email },
        });

        await transferScreenshotsToGCP(user.refreshToken, user.email);

        logger.info({
            functionName,
            statusCode: StatusCodes.OK,
            message: "Screenshot transfer completed successfully",
            data: { userId: user.googleId, email: user.email },
        });

        res.status(StatusCodes.OK).json({
            success: true,
            message: SuccessResponseMessages.TRANSFER("Screenshot"),
        });
    } catch (error) {
        logger.error({
            functionName,
            statusCode: StatusCodes.INTERNAL_SERVER_ERROR,
            message: "Error during screenshot transfer",
            data: { error: (error as Error).message },
        });

        res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
            success: false,
            message: ErrorResponseMessages.INTERNAL_ERROR,
            error: (error as Error).message,
        });
    }
}

export { triggerTransfer };
