import express from "express";
import * as driveController from "../controllers/driveController";
import { authMiddleware } from "../middleware/authMiddleware";
import { AuthenticatedRequest } from "../constants/types.constants";

//restrictTo check

const router = express.Router();
router.get("/folders", authMiddleware, async (req, res, next) => driveController.getAllFolders(req as unknown as AuthenticatedRequest, res).catch(next));

router.get("/folders/:folderId", authMiddleware, async (req, res, next) => driveController.getFilesInFolder(req as unknown as  AuthenticatedRequest, res).catch(next));

router.delete("/files/:fileId", authMiddleware, async (req, res, next) => driveController.deleteFile(req as unknown as AuthenticatedRequest, res).catch(next));
export default router;


