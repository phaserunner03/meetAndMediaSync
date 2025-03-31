import { Router } from "express";

import authRoutes from "./authRoutes";
import userRoutes from "./userRoutes";
import roleRoutes from "./roleRoutes";
import driveRoutes from "./driveRoutes"
import meetingRoutes from "./meetingRoutes";
import transferRoutes from "./transferRoutes";
import { ServerResponseMessages } from "../constants/service-messages.constants";
import { secretVariables } from "../constants/environments.constants";



const router = Router()
router.get("/healthcheck", (req, res) => {
    return res.status(200).json({
        success: true,
        message: ServerResponseMessages.SERVER,
        data: {}
    });
})
router.use("/auth/", authRoutes);
router.use(`/users/${secretVariables.USER_API_VERSION}`, userRoutes);
router.use(`/roles/${secretVariables.ROLE_API_VERSION}`, roleRoutes);
router.use(`/meetings/${secretVariables.MEET_API_VERSION}`, meetingRoutes);
router.use(`/drive/${secretVariables.DRIVE_API_VERSION}`, driveRoutes);
router.use(`/transfer/${secretVariables.TRANSFER_API_VERSION}`, transferRoutes);

export default router;