const express = require("express");
const router = express.Router();
const authMiddleware=require('../middleware/authMiddleware');


const meetingController = require("../controllers/meetingController");

router.post("/schedule",authMiddleware, meetingController.scheduleMeeting);
router.get("/all",authMiddleware,meetingController.getAllMeetings);
router.get("/test",meetingController.test);
// router.get("/:title", meetingController.getMeeting);
// router.put("/:meetingID", meetingController.updateMeeting);

module.exports = router;