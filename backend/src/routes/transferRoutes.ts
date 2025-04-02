import express from "express";
import { triggerTransfer } from "../controllers/transferController";
import { authMiddleware } from "../middleware/authMiddleware";
import { AuthenticatedRequest } from "../constants/types.constants";

const router = express.Router();

router.post("/gcp", authMiddleware, async (req, res, next) => triggerTransfer(req as unknown as  AuthenticatedRequest, res).catch(next));

export default router;
