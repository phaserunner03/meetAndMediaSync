import { Request, Response } from "express";
import * as driveService from "../services/driveServices";
import { StatusCodes } from "../constants/status-codes.constants";
import { ErrorResponseMessages, SuccessResponseMessages } from "../constants/service-messages.constants";
import logger from "../utils/logger";


interface AuthenticatedRequest extends Request {
    user: any;
}

const functionName = {
    getAllFolders: "getAllFolders",
    getFilesInFolder: "getFilesInFolder",
    deleteFile: "deleteFile",
};


// Fetch all folders inside CloudCapture
const getAllFolders = async (req: AuthenticatedRequest, res: Response) => {
    try {
        const { user } = req;
        
        if (!user?.refreshToken) {
            logger.warn({
                functionName: functionName.getAllFolders,
                statusCode: StatusCodes.UNAUTHORIZED,
                message: "Unauthorized request - No refresh token",
                data: {},
            });
            return res.status(StatusCodes.UNAUTHORIZED).json({
                success: false,
                message: ErrorResponseMessages.UNAUTHORIZED,
                data: {},
            });
        }
        const folders = await driveService.getAllFolders(user.refreshToken);

        logger.info({
            functionName: functionName.getAllFolders,
            statusCode: StatusCodes.OK,
            message: "Folders fetched successfully",
            data: { folderCount: folders.length },
        });

        res.status(StatusCodes.OK).json({
            success: true,
            message: SuccessResponseMessages.FETCHED("Folders"),
            data: { folders },
        });

    } catch (error) {
        logger.error({
            functionName: functionName.getAllFolders,
            statusCode: StatusCodes.INTERNAL_SERVER_ERROR,
            message: "Error fetching folders",
            data: {
                name: (error as Error).name,
                stack: (error as Error).stack
            }
        });
        
        res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
            success: false,
            message: ErrorResponseMessages.INTERNAL_ERROR,
            data: { error: (error as Error).message },
        });
        
    }
};

// Fetch files inside a specific folder
const getFilesInFolder = async (req: AuthenticatedRequest, res: Response) => {
    try {
        const { user } = req;
        const { folderId } = req.params;

        if (!user?.refreshToken) {
            
            logger.warn({
                functionName: functionName.getFilesInFolder,
                statusCode: StatusCodes.UNAUTHORIZED,
                message: "Unauthorized request - No refresh token",
                data: {},
            });

            return res.status(StatusCodes.UNAUTHORIZED).json({
                success: false,
                message: ErrorResponseMessages.UNAUTHORIZED,
                data: {},
            });
        }

        if (!folderId) {
            logger.warn({
                functionName: functionName.getFilesInFolder,
                statusCode: StatusCodes.BAD_REQUEST,
                message: "Folder ID is required",
                data: {},
            });

            return res.status(StatusCodes.BAD_REQUEST).json({
                success: false,
                message: ErrorResponseMessages.BAD_REQUEST("Folder ID is required"),
                data: {},
            });
        }

        const files = await driveService.getFilesInFolder(user.refreshToken, folderId);
        logger.info({
            functionName: functionName.getFilesInFolder,
            statusCode: StatusCodes.OK,
            message: "Files fetched successfully",
            data: { fileCount: files.length },
        });

        res.status(StatusCodes.OK).json({
            success: true,
            message: SuccessResponseMessages.FETCHED("Files"),
            data: { files },
        });

    } catch (error) {
        logger.error({
            functionName: functionName.getFilesInFolder,
            statusCode: StatusCodes.INTERNAL_SERVER_ERROR,
            message: "Error fetching files",
            data: {
                name: (error as Error).name,
                stack: (error as Error).stack
            }
        });
        res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
            success: false,
            message: ErrorResponseMessages.INTERNAL_ERROR,
            data: { error: (error as Error).message },
        });
    }
};

// Delete a file
const deleteFile = async (req: AuthenticatedRequest, res: Response) => {
    try {
        const { user } = req;
        const { fileId } = req.params;

        if (!user?.refreshToken) {
            return res.status(StatusCodes.UNAUTHORIZED).json({
                success: false,
                message: ErrorResponseMessages.UNAUTHORIZED,
                data: {},
            });
        }

        if (!fileId) {
            return res.status(StatusCodes.BAD_REQUEST).json({
                success: false,
                message: ErrorResponseMessages.BAD_REQUEST("File ID is required"),
                data: {},
            });
        }

        await driveService.deleteFile(user.refreshToken, fileId);
        res.status(StatusCodes.OK).json({
            success: true,
            message: SuccessResponseMessages.DELETED("File"),
            data: {},
        });
    } catch (err) {
        console.error("Error deleting file:", err);
        res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
            success: false,
            message: ErrorResponseMessages.INTERNAL_ERROR,
            data: { error: (err as Error).message },
        });
    }
};

const mediaLog = async (req: AuthenticatedRequest, res: Response) => {
    try {
        const { meetingID, type, fileUrl, fileName, storedIn, movedToGCP, timestamp } = req.body;

        if (!meetingID || !fileUrl || !timestamp) {
            return res.status(400).json({ success: false, message: "Missing required fields." });
        }

        const media = await driveService.mediaLog(meetingID, type, fileUrl, fileName, storedIn, movedToGCP, timestamp);

        return res.status(201).json({
            success: true,
            message: "Media record created successfully.",
            media,
        });

    } catch (error) {
        console.error("Error creating media record:", error);
        return res.status(500).json({ success: false, message: "Internal server error." });
    }
};

export { getAllFolders, getFilesInFolder, deleteFile, mediaLog };
