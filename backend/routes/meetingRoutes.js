const express = require("express");
const router = express.Router();
const authMiddleware=require('../middleware/authMiddleware');


const meetingController = require("../controllers/meetingController");


router.get("/all",authMiddleware.authMiddleware,meetingController.getAllMeetings);
// router.get("/our",authMiddleware,meetingController.getOurMeetings);
router.post("/schedule-group",authMiddleware.authMiddleware, authMiddleware.restrictToAdmin,meetingController.scheduleMeeting);
router.post("/schedule",authMiddleware.authMiddleware,meetingController.scheduleMeeting);
router.get("/test",meetingController.test);


module.exports = router;