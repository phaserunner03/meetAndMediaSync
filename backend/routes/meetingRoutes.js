const express = require("express");
const router = express.Router();
const auth=require('../middleware/auth');

const meetingController = require("../controllers/meetingController");

router.post("/schedule", auth.authenticateUser, meetingController.scheduleMeeting);
router.get("/all", auth.authenticateUser, meetingController.getAllMeetings);
// router.get("/:title", meetingController.getMeeting);
// router.put("/:meetingID", meetingController.updateMeeting);

module.exports = router;