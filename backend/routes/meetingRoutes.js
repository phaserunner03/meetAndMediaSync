const express = require("express");
const router = express.Router();
const auth=require('../middleware/auth');

const meetingController = require("../controllers/meetingController");

router.post("/schedule", meetingController.scheduleMeeting);
router.get("/all", meetingController.getAllMeetings);
// router.get("/:title", meetingController.getMeeting);
// router.put("/:meetingID", meetingController.updateMeeting);

module.exports = router;