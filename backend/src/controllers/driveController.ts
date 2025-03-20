import { Request, Response } from "express";
import * as driveService from "../services/driveServices";

interface AuthenticatedRequest extends Request {
    user: any;
}

// Fetch all folders inside CloudCapture
const getAllFolders = async (req: AuthenticatedRequest, res: Response) => {
    try {
        const { user } = req;
        const folders = await driveService.getAllFolders(user.refreshToken);
        res.status(200).json({ success: true, message: "Folders fetched successfully", data: { folders } });
    } catch (err) {
        res.status(500).json({ success: false, message: (err as Error).message, data: {} });
    }
};

// Fetch files inside a specific folder
const getFilesInFolder = async (req: AuthenticatedRequest, res: Response) => {
    try {
        const { user } = req;
        const { folderId } = req.params;

        if (!folderId) {
            return res.status(400).json({ success: false, message: "Folder ID is required", data: {} });
        }

        const files = await driveService.getFilesInFolder(user.refreshToken, folderId);
        res.status(200).json({ success: true, message: "Files fetched successfully", data: { files } });
    } catch (err) {
        res.status(500).json({ success: false, message: (err as Error).message, data: {} });
    }
};

// Delete a file
const deleteFile = async (req: AuthenticatedRequest, res: Response) => {
    try {
        const { user } = req;
        const { fileId } = req.params;

        if (!fileId) {
            return res.status(400).json({ success: false, message: "File ID is required", data: {} });
        }

        await driveService.deleteFile(user.refreshToken, fileId);
        res.status(200).json({ success: true, message: "File deleted successfully", data: {} });
    } catch (err) {
        res.status(500).json({ success: false, message: (err as Error).message, data: {} });
    }
};

export { getAllFolders, getFilesInFolder, deleteFile };
