const Meeting = require('../models/Meeting');
const MeetingDetails = require('../models/MeetingDetails');
const {google} = require('googleapis');

const validateMeetingDetails = async (user, participants, startTime, endTime) => {
    const now = new Date();

    if (new Date(startTime) < now) {
        return { success: false, message: 'Meeting cannot be scheduled in the past' };
    }

    if (new Date(startTime) > new Date(endTime)) {
        return { success: false, message: 'End time cannot be before start time' };
    }

    if (participants.length < 1) {
        return { success: false, message: 'At least one participant is required' };
    }

    if(participants.length>=2 && user.role!=='ADMIN'){
        return { success: false, message: 'You can only schedule one-to-one meetings' };

    }

    const existingMeeting = await MeetingDetails.findOne({
        startTime: { $gte: new Date(startTime), $lt: new Date(endTime) }, // Check overlapping time
    }).populate({
        path: 'meetingID', // Populate Meeting data
        match: { scheduledBy: user._id } // Ensure it's scheduled by the current user
    });
    
    

    if (existingMeeting) {
        return { success: false, message: 'You already have a meeting scheduled at this time' };
    }

    return { success: true };
};



module.exports = validateMeetingDetails;
