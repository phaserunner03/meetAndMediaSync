import { Request, Response } from "express";
import { transferScreenshotsToGCP } from "../services/transferService";
import { StatusCodes } from "../constants/status-codes.constants";

interface AuthenticatedRequest extends Request {
    user: any;
}

async function triggerTransfer(req: AuthenticatedRequest, res: Response) {
    const { user } = req;

    try {
        await transferScreenshotsToGCP(user.refreshToken, user.email);
        res.status(StatusCodes.OK).json({ success: true, message: "Transfer initiated successfully" });
    } catch (error) {
        res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ 
            success: false, 
            message: "Transfer failed", 
            error: (error as Error).message 
        });
    }
}

export { triggerTransfer };
