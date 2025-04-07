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


const router = Router()
router.get("/healthcheck", (req, res) => {
    return res.status(StatusCodes.OK).json({
        success: true,
        message: ServerResponseMessages.SERVER,
        data: {}
    });
})
router.use(`/auth/${secretVariables.AUTH_API_VERSION}`, authRoutes);
router.use(`/users/${secretVariables.USER_API_VERSION}`, userRoutes);
router.use(`/roles/${secretVariables.ROLE_API_VERSION}`, roleRoutes);
router.use(`/meetings/${secretVariables.MEET_API_VERSION}`, meetingRoutes);
router.use(`/drive/${secretVariables.DRIVE_API_VERSION}`, driveRoutes);
router.use(`/transfer/${secretVariables.TRANSFER_API_VERSION}`, transferRoutes);
router.use(`/reports/${secretVariables.ROLE_API_VERSION}`, reportRoutes);

export default router;