const meetingService = require('../services/meetingService');

const scheduleMeeting = async (req, res) => {
  try {
    const { organizerId, title, description, participants, startTime, endTime } = req.body;

    if (!organizerId || !title || !startTime || !endTime) {
      return res.status(400).json({ message: 'Missing required fields' });
    }

    const result = await meetingService.scheduleMeeting({
      organizerId,
      title,
      description,
      participants,
      startTime,
      endTime,
    });

    res.status(201).json(result);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const getAllMeetings = async (req, res) => {
  try {
    const result = await meetingService.getAllMeetings();
    res.status(200).json(result);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = { scheduleMeeting, getAllMeetings };
