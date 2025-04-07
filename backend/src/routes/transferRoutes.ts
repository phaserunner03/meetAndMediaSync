import express from "express";
import { triggerTransfer } from "../controllers/transferController";
import { authMiddleware } from "../middleware/authMiddleware";
import { AuthenticatedRequest } from "../constants/types.constants";
import {validateRequest} from "../middleware/requestValidationMiddleware";
import * as transferSchema from "../schemas/transfer.schema";

/**
 * @swagger
 * tags:
 *   name: Transfers
 *   description: Transfer-related APIs
 */

/**
 * @swagger
 * /tranfer/v1/gcp:
 *   post:
 *     summary: Trigger transfer of screenshots to GCP
 *     tags: [Transfers]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/TriggerTransferRequest'
 *     responses:
 *       200:
 *         description: Transfer triggered successfully
 */

const router = express.Router();

router.post("/gcp", authMiddleware,validateRequest(transferSchema.triggerTransferRequest), async (req, res, next) => triggerTransfer(req as unknown as  AuthenticatedRequest, res).catch(next));

export default router;
