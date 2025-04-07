import express from "express";
import { generateReport } from "../controllers/reportController";
import { authMiddleware } from "../middleware/authMiddleware";
import { AuthenticatedRequest } from "../constants/types.constants";

const router = express.Router();


router.get("/report", authMiddleware, async (req, res, next) => generateReport(req as unknown as  AuthenticatedRequest, res).catch(next));

export default router;
