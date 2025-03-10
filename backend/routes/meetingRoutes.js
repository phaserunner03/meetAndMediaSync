const express = require("express");
const router = express.Router();
const meetingController = require("../controllers/meetingController");
const { authMiddleware, restrictTo } = require("../middleware/authMiddleware");

router.get("/all", authMiddleware, restrictTo('viewMeeting'), meetingController.getAllMeetings);
router.post("/schedule-group", authMiddleware, restrictTo('groupMeeting'), meetingController.scheduleMeeting);
router.post("/schedule", authMiddleware, restrictTo('createMeeting'), meetingController.scheduleMeeting);
router.put("/update/:eventId", authMiddleware, restrictTo('editMeeting'), meetingController.updateMeeting);
router.delete("/delete/:eventId", authMiddleware, restrictTo('deleteMeeting'), meetingController.deleteMeeting);

module.exports = router;
