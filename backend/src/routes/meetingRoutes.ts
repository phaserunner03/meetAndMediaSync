import express from "express";
import * as meetingController from "../controllers/meetingController";
import { authMiddleware, restrictTo } from "../middleware/authMiddleware";
import { Permissions } from "../constants/permissions.constants";
import { validateRequest } from "../middleware/requestValidationMiddleware";
import {scheduleMeetingRequest,updateMeetingRequest, verifyMeetingRequest,} from "../schemas/meetings.schema";


const router = express.Router();

export interface AuthenticatedRequest extends express.Request {
    user: {
        googleId: string;
    };
}

router.get("/all", authMiddleware, restrictTo(Permissions.VIEW_USER), (req, res, next) => meetingController.getAllMeetings(req as AuthenticatedRequest, res).catch(next));
router.post("/schedule", authMiddleware, restrictTo(Permissions.CREATE_MEETING),validateRequest(scheduleMeetingRequest), (req, res, next) => meetingController.scheduleMeeting(req as   AuthenticatedRequest, res).catch(next));
router.put("/update/:eventId", authMiddleware, restrictTo(Permissions.EDIT_MEETING),validateRequest(updateMeetingRequest),(req, res, next) =>  meetingController.updateMeeting(req as AuthenticatedRequest, res).catch(next));
router.delete("/delete/:eventId", authMiddleware, restrictTo(Permissions.DELETE_MEETING), (req, res, next) => meetingController.deleteMeeting(req as AuthenticatedRequest, res).catch(next));
router.post("/verify",validateRequest(verifyMeetingRequest),(req, res) => meetingController.verifyMeeting(req as AuthenticatedRequest, res));

export default router;
