import express from "express";
import { generateReport } from "../controllers/reportController";
import { authMiddleware, restrictTo } from "../middleware/authMiddleware";
import { AuthenticatedRequest } from "../constants/types.constants";
import { Permissions } from "../constants/permissions.constants";

const router = express.Router();

/**
 * @swagger
 * tags:
 *   name: Reports
 *   description: Report generation APIs
 */

/**
 * @swagger
 * /reports/v1/report:
 *   get:
 *     summary: Generate a report
 *     tags: [Reports]
 *     responses:
 *       200:
 *         description: Report generated successfully
 */

router.get("/report", authMiddleware, restrictTo(Permissions.VIEW_REPORT) ,async (req, res, next) => generateReport(req as unknown as AuthenticatedRequest, res).catch(next));

export default router;
