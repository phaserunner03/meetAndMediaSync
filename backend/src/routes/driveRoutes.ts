import express from "express";
import * as driveController from "../controllers/driveController";
import { authMiddleware } from "../middleware/authMiddleware";
import { validateRequest } from "../middleware/requestValidationMiddleware";
import * as driveSchema from "../schemas/drive.schemas";

export interface AuthenticatedRequest extends express.Request {
    user: {
        googleId: string;
    };
}

/**
 * @swagger
 * tags:
 *   name: Drive
 *   description: Google Drive-related APIs
 */

/**
 * @swagger
 * /drive/v1/folders:
 *   get:
 *     summary: Get all folders in CloudCapture
 *     tags: [Drive]
 *     responses:
 *       200:
 *         description: Folders fetched successfully
 */

/**
 * @swagger
 * /drive/v1/folders/{folderId}:
 *   get:
 *     summary: Get files in a specific folder
 *     tags: [Drive]
 *     parameters:
 *       - in: path
 *         name: folderId
 *         required: true
 *         schema:
 *           type: string
 *         description: ID of the folder
 *     responses:
 *       200:
 *         description: Files fetched successfully
 */

/**
 * @swagger
 * /drive/v1/files/{fileId}:
 *   delete:
 *     summary: Delete a file
 *     tags: [Drive]
 *     parameters:
 *       - in: path
 *         name: fileId
 *         required: true
 *         schema:
 *           type: string
 *         description: ID of the file to delete
 *     responses:
 *       200:
 *         description: File deleted successfully
 */

/**
 * @swagger
 * /drive/v1/mediaLogs:
 *   post:
 *     summary: Create a media log
 *     tags: [Drive]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/MediaLogRequest'
 *     responses:
 *       201:
 *         description: Media log created successfully
 */

const router = express.Router();
router.get("/folders", authMiddleware, async (req, res, next) => driveController.getAllFolders(req as unknown as AuthenticatedRequest, res).catch(next));

router.get("/folders/:folderId", authMiddleware, async (req, res, next) => driveController.getFilesInFolder(req as unknown as  AuthenticatedRequest, res).catch(next));

router.delete("/files/:fileId", authMiddleware, async (req, res, next) => driveController.deleteFile(req as unknown as AuthenticatedRequest, res).catch(next));

router.post("/mediaLogs",validateRequest(driveSchema.mediaLogRequest), async (req, res, next) => driveController.mediaLog(req as unknown as AuthenticatedRequest, res).catch(next));

export default router;


