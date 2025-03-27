import { Request, Response } from "express";
import { transferScreenshotsToGCP } from "../services/transferService";
import { StatusCodes } from "../constants/status-codes.constants";
import { ErrorResponseMessages, SuccessResponseMessages } from "../constants/service-messages.constants";

interface AuthenticatedRequest extends Request {
    user?: {
        refreshToken: string;
        email: string;
    };
}

async function triggerTransfer(req: AuthenticatedRequest, res: Response) {
    try {
        const { user } = req;

        if (!user?.refreshToken || !user?.email) {
            return res.status(StatusCodes.UNAUTHORIZED).json({
                success: false,
                message: ErrorResponseMessages.UNAUTHORIZED,
            });
        }

        await transferScreenshotsToGCP(user.refreshToken, user.email);

        res.status(StatusCodes.OK).json({
            success: true,
            message: SuccessResponseMessages.TRANSFER("Screenshot"),
        });
    } catch (error) {
        console.error("❌ Error during screenshot transfer:", error);

        res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
            success: false,
            message: ErrorResponseMessages.INTERNAL_ERROR,
            error: (error as Error).message,
        });
    }
}

export { triggerTransfer };
