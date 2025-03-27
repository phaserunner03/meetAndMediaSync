import { Router } from "express";

import authRoutes from "./authRoutes";
import userRoutes from "./userRoutes";
import roleRoutes from "./roleRoutes";
import driveRoutes from "./driveRoutes"
import meetingRoutes from "./meetingRoutes";
import transferRoutes from "./transferRoutes";
import { ServerResponseMessages } from "../constants/service-messages.constants";
import { SecretVariables } from "../constants/environments.constants";



const router = Router()
router.get("/healthcheck", (req, res) => {
    return res.status(200).json({
        success: true,
        message: ServerResponseMessages.SERVER,
        data: {}
    });
})
router.use(`/auth/${SecretVariables.AUTH_API_VERSION}`, authRoutes);
router.use(`/users/${SecretVariables.USER_API_VERSION}`, userRoutes);
router.use(`/roles/${SecretVariables.ROLE_API_VERSION}`, roleRoutes);
router.use(`/meetings/${SecretVariables.MEET_API_VERSION}`, meetingRoutes);
router.use(`/drive/${SecretVariables.DRIVE_API_VERSION}`, driveRoutes);
router.use(`/transfer/${SecretVariables.TRANSFER_API_VERSION}`, transferRoutes);

export default router;