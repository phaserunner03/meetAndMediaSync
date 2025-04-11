import express from "express";
import * as meetingController from "../controllers/meetingController";
import { authMiddleware, restrictTo } from "../middleware/authMiddleware";
import { Permissions } from "../constants/permissions.constants";
import * as meetingSchema from "../schemas/meetings.schema";
import { validateRequest } from "../middleware/requestValidationMiddleware";
const router = express.Router();

export interface AuthenticatedRequest extends express.Request {
    user: {
        googleId: string;
    };
}

/**
 * @swagger
 * tags:
 *   name: Meetings
 *   description: Meeting-related APIs
 */

/**
 * @swagger
 * /meetings/v1/all:
 *   get:
 *     summary: Get all meetings
 *     tags: [Meetings]
 *     parameters:
 *       - in: query
 *         name: year
 *         required: true
 *         schema:
 *           type: integer
 *         description: The year for which to fetch meetings
 *       - in: query
 *         name: month
 *         required: true
 *         schema:
 *           type: integer
 *         description: The month for which to fetch meetings
 *     responses:
 *       200:
 *         description: Meetings fetched successfully
 */

/**
 * @swagger
 * /meetings/v1/schedule:
 *   post:
 *     summary: Schedule a new meeting
 *     tags: [Meetings]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               title:
 *                 type: string
 *               location:
 *                 type: string
 *               description:
 *                 type: string
 *               participants:
 *                 type: array
 *                 items:
 *                   type: string
 *               startTime:
 *                 type: string
 *                 format: date-time
 *               endTime:
 *                 type: string
 *                 format: date-time
 *             required:
 *               - title
 *               - participants
 *               - startTime
 *               - endTime
 *     responses:
 *       201:
 *         description: Meeting scheduled successfully
 */

/**
 * @swagger
 * /meetings/v1/update/{eventId}:
 *   put:
 *     summary: Update an existing meeting
 *     tags: [Meetings]
 *     parameters:
 *       - in: path
 *         name: eventId
 *         required: true
 *         schema:
 *           type: string
 *         description: ID of the meeting to update
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               title:
 *                 type: string
 *               location:
 *                 type: string
 *               description:
 *                 type: string
 *               participants:
 *                 type: array
 *                 items:
 *                   type: string
 *               startTime:
 *                 type: string
 *                 format: date-time
 *               endTime:
 *                 type: string
 *                 format: date-time
 *     responses:
 *       200:
 *         description: Meeting updated successfully
 */

/**
 * @swagger
 * /meetings/v1/delete/{eventId}:
 *   delete:
 *     summary: Delete a meeting
 *     tags: [Meetings]
 *     parameters:
 *       - in: path
 *         name: eventId
 *         required: true
 *         schema:
 *           type: string
 *         description: ID of the meeting to delete
 *     responses:
 *       200:
 *         description: Meeting deleted successfully
 */

/**
 * @swagger
 * /meetings/v1/verify:
 *   post:
 *     summary: Verify meeting details
 *     tags: [Meetings]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               meetingCode:
 *                 type: string
 *               token:
 *                 type: string
 *             required:
 *               - meetingCode
 *               - token
 *     responses:
 *       200:
 *         description: Meeting verified successfully
 */

router.get("/all", authMiddleware, restrictTo(Permissions.VIEW_USER), (req, res, next) => meetingController.getAllMeetings(req as AuthenticatedRequest, res).catch(next));
router.post("/schedule", authMiddleware, restrictTo(Permissions.CREATE_MEETING), validateRequest(meetingSchema.scheduleMeetingRequest), (req, res, next) => meetingController.scheduleMeeting(req as AuthenticatedRequest, res).catch(next));
router.put("/update/:eventId", authMiddleware, restrictTo(Permissions.EDIT_MEETING), validateRequest(meetingSchema.updateMeetingRequest), (req, res, next) => meetingController.updateMeeting(req as AuthenticatedRequest, res).catch(next));
router.delete("/delete/:eventId", authMiddleware, restrictTo(Permissions.DELETE_MEETING), (req, res, next) => meetingController.deleteMeeting(req as AuthenticatedRequest, res).catch(next));
router.post("/verify", validateRequest(meetingSchema.verifyMeetingRequest), (req, res) => meetingController.verifyMeeting(req as AuthenticatedRequest, res));

export default router;
