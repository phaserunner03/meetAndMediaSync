import { Request, Response } from "express";
import { transferScreenshotsToGCP } from "../services/transferService";

interface AuthenticatedRequest extends Request {
    user: any;
}

async function triggerTransfer(req: AuthenticatedRequest, res: Response) {
    const { user } = req;
    
    try {
        await transferScreenshotsToGCP(user.refreshToken, user.email);
        res.status(200).json({ message: "Transfer initiated successfully" });
    } catch (error) {
        res.status(500).json({ message: "Transfer failed", error });
    }
}

export { triggerTransfer };
