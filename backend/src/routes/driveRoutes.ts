import express from "express";
import * as driveController from "../controllers/driveController";
import { authMiddleware } from "../middleware/authMiddleware";
import { AuthenticatedRequest } from "../controllers/authController";

const router = express.Router();
router.get("/folders", authMiddleware, async (req, res, next) => {
    try {
        await driveController.getAllFolders(req as AuthenticatedRequest, res);
    } catch (error) {
        next(error);
    }
});

router.get("/folders/:folderId", authMiddleware, async (req, res, next) => {
    try {
        await driveController.getFilesInFolder(req as AuthenticatedRequest, res);
    } catch (error) {
        next(error);
    }
});

router.delete("/files/:fileId", authMiddleware, async (req, res, next) => {
    try {
        await driveController.deleteFile(req as AuthenticatedRequest, res);
    } catch (error) {
        next(error);
    }
});
export default router;


