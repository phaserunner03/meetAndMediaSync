import { Router } from "express";
import { StatusCodes } from "../constants/status-codes.constants";

import authRoutes from "./authRoutes";
import userRoutes from "./userRoutes";
import roleRoutes from "./roleRoutes";
import driveRoutes from "./driveRoutes"
import meetingRoutes from "./meetingRoutes";
import transferRoutes from "./transferRoutes";
import { ServerResponseMessages } from "../constants/service-messages.constants";
import { secretVariables } from "../constants/environments.constants";
import reportRoutes from "./reportRoutes";

/**
 * @swagger
 * tags:
 *   - name: Auth
 *     description: Authentication APIs
 *   - name: Users
 *     description: User management APIs
 *   - name: Roles
 *     description: Role management APIs
 *   - name: Meetings
 *     description: Meeting-related APIs
 *   - name: Drive
 *     description: Google Drive-related APIs
 *   - name: Transfers
 *     description: Transfer-related APIs
 *   - name: Reports
 *     description: Report generation APIs
 */

/**
 * @swagger
 * /healthcheck:
 *   get:
 *     summary: Health check endpoint
 *     tags: [Health]
 *     responses:
 *       200:
 *         description: Server is running
 */

const router = Router()
router.get("/healthcheck", (req, res) => {
    return res.status(StatusCodes.OK).json({
        success: true,
        message: ServerResponseMessages.SERVER,
        data: {}
    });
})

/**
 * @swagger
 * /auth/v1:
 *   description: Authentication routes
 */

/**
 * @swagger
 * /users/v1:
 *   description: User management routes
 */

/**
 * @swagger
 * /roles/v1:
 *   description: Role management routes
 */

/**
 * @swagger
 * /meetings/v1:
 *   description: Meeting-related routes
 */

/**
 * @swagger
 * /drive/v1:
 *   description: Google Drive-related routes
 */

/**
 * @swagger
 * /transfer/v1:
 *   description: Transfer-related routes
 */

/**
 * @swagger
 * /reports/v1:
 *   description: Report generation routes
 */

router.use(`/auth/${secretVariables.AUTH_API_VERSION}`, authRoutes);
router.use(`/users/${secretVariables.USER_API_VERSION}`, userRoutes);
router.use(`/roles/${secretVariables.ROLE_API_VERSION}`, roleRoutes);
router.use(`/meetings/${secretVariables.MEET_API_VERSION}`, meetingRoutes);
router.use(`/drive/${secretVariables.DRIVE_API_VERSION}`, driveRoutes);
router.use(`/transfer/${secretVariables.TRANSFER_API_VERSION}`, transferRoutes);
router.use(`/reports/${secretVariables.ROLE_API_VERSION}`, reportRoutes);

export default router;