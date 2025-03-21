import express from "express";
import * as meetingController from "../controllers/meetingController";
import { authMiddleware, restrictTo } from "../middleware/authMiddleware";
import { AuthenticatedRequest } from "../controllers/authController";


const router = express.Router();

router.get("/all", authMiddleware, restrictTo('viewMeeting'), (req, res, next) => meetingController.getAllMeetings(req as AuthenticatedRequest, res).catch(next));
// router.post("/schedule-group", authMiddleware, restrictTo('groupMeeting'),(req, res, next) =>  meetingController.scheduleMeeting(req as AuthenticatedRequest, res).catch(next));
router.post("/schedule", authMiddleware, restrictTo('createMeeting'), (req, res, next) => meetingController.scheduleMeeting(req as AuthenticatedRequest, res).catch(next));
router.put("/update/:eventId", authMiddleware, restrictTo('editMeeting'),(req, res, next) =>  meetingController.updateMeeting(req as AuthenticatedRequest, res).catch(next));
router.delete("/delete/:eventId", authMiddleware, restrictTo('deleteMeeting'), (req, res, next) => meetingController.deleteMeeting(req as AuthenticatedRequest, res).catch(next));

export default router;
