import express from "express";
import * as meetingController from "../controllers/meetingController";
import { authMiddleware, restrictTo } from "../middleware/authMiddleware";
import { AuthenticatedRequest } from "../controllers/authController";
import { Permissions } from "../constants/permissions.constants";


const router = express.Router();

router.get("/all", authMiddleware, restrictTo(Permissions.VIEW_USER), (req, res, next) => meetingController.getAllMeetings(req as AuthenticatedRequest, res).catch(next));
router.post("/schedule", authMiddleware, restrictTo(Permissions.CREATE_MEETING), (req, res, next) => meetingController.scheduleMeeting(req as AuthenticatedRequest, res).catch(next));
router.put("/update/:eventId", authMiddleware, restrictTo(Permissions.EDIT_MEETING),(req, res, next) =>  meetingController.updateMeeting(req as AuthenticatedRequest, res).catch(next));
router.delete("/delete/:eventId", authMiddleware, restrictTo(Permissions.DELETE_MEETING), (req, res, next) => meetingController.deleteMeeting(req as AuthenticatedRequest, res).catch(next));
router.post("/verify",(req, res) => meetingController.verifyMeeting(req as AuthenticatedRequest, res));

export default router;
