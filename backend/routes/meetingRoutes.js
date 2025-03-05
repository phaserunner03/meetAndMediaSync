const express = require("express");
const router = express.Router();
const authMiddleware = require("../middleware/authMiddleware");
const meetingController = require("../controllers/meetingController");

router.get("/all", authMiddleware.authMiddleware, meetingController.getAllMeetings);
router.post("/schedule-group", authMiddleware.authMiddleware, authMiddleware.restrictToAdmin, meetingController.scheduleMeeting);
router.post("/schedule", authMiddleware.authMiddleware, meetingController.scheduleMeeting);
router.put("/update/:eventId", authMiddleware.authMiddleware, meetingController.updateMeeting);  
router.delete("/delete/:eventId", authMiddleware.authMiddleware, meetingController.deleteMeeting); 

module.exports = router;
