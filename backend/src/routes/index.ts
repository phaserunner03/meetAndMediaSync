import { Router } from "express";

import authRoutes from "./authRoutes";
import userRoutes from "./userRoutes";
import roleRoutes from "./roleRoutes";
import driveRoutes from "./driveRoutes"
import meetingRoutes from "./meetingRoutes";
import transferRoutes from "./transferRoutes";



const router = Router()
router.get("/heathCheck", (req, res) => {
    return res.status(200).json({
        success: true,
        message: "Your server is up and running....",
        data: {}
    });
})
router.use("/auth", authRoutes);
router.use("/users", userRoutes);
router.use("/roles", roleRoutes);
router.use("/meetings", meetingRoutes);
router.use("/drive", driveRoutes);
router.use("/transfer", transferRoutes);

export default router