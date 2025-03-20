import { Request, Response } from "express";
import * as driveService from "../services/driveServices";


interface AuthenticatedRequest extends Request {
    user: any;
}

const getAllFolders = async (req: AuthenticatedRequest, res: Response) => {
    try {
        const { user } = req;
        const files = await driveService.getAllFolders(user.refreshToken);
        res.status(200).json({ success: true, files });
    } catch (err) {
        if (err instanceof Error) {
            res.status(500).json({ message: err.message });
        } else {
            res.status(500).json({ message: "An unknown error occurred" });
        }
    }
    
};
const getFilesInFolder = async (req: AuthenticatedRequest, res: Response) => {
    try {
        const { user } = req;
        const { folderId } = req.params;
        if (!folderId) {
            return res.status(400).json({ success: false, message: "Folder ID is required" });
        }
        const files = await driveService.getFilesInFolder(user.refreshToken, folderId);
        res.status(200).json({ success: true, files });
    } catch (err) {
        res.status(500).json({ message: err instanceof Error ? err.message : "An unknown error occurred" });
    }
};

const deleteFile = async (req: AuthenticatedRequest, res: Response) => {
    try {
        const { user } = req;
        const { fileId } = req.params;
        if (!fileId) {
            return res.status(400).json({ success: false, message: "File ID is required" });
        }
        await driveService.deleteFile(user.refreshToken, fileId);
        res.status(200).json({ success: true, message: "File deleted successfully" });
    } catch (err) {
        res.status(500).json({ message: err instanceof Error ? err.message : "An unknown error occurred" });
    }
};


export {getAllFolders, deleteFile, getFilesInFolder };