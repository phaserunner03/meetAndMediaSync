const { calendar } = require('../config/googleConfig');
const Meeting = require('../models/Meeting');
const MeetingDetails = require('../models/MeetingDetails');
const admin = require('./firebaseAdmin');

const scheduleMeeting = async ({ token, title, description, participants, startTime, endTime }) => {
    try {
        // Verify Firebase Token
        const decodedToken = await admin.auth().verifyIdToken(token);
        const organizerId = decodedToken.uid; // Firebase UID of the user

        if (!organizerId) throw new Error('Organizer authentication failed');

        // Create Google Calendar Event with Google Meet link
        const event = {
            summary: title,
            description,
            start: { dateTime: startTime, timeZone: 'UTC' },
            end: { dateTime: endTime, timeZone: 'UTC' },
            attendees: participants.map(id => ({ email: id })), // Assuming IDs are emails
            conferenceData: { createRequest: { requestId: `${Date.now()}` } },
        };

        const response = await calendar.events.insert({
            calendarId: 'primary',
            resource: event,
            conferenceDataVersion: 1,
        });

        const meetLink = response.data.hangoutLink;

        // Save Meeting in MongoDB
        const newMeeting = new Meeting({
            title,
            description,
            meetLink,
            scheduledBy: organizerId,
        });

        const savedMeeting = await newMeeting.save();

        // Determine if the meeting is upcoming or past
        const meetingHistory = new Date(startTime) > new Date() ? 'upcoming' : 'past';

        // Save Meeting Details
        const newMeetingDetails = new MeetingDetails({
            meetingID: savedMeeting._id,
            meetingDate: startTime,
            meetingHistory,
            meetingType: participants.length > 1 ? 'group' : 'one to one',
            participants,
            startTime,
            endTime,
        });

        await newMeetingDetails.save();

        return { success: true, meetLink, meetingId: savedMeeting._id };
    } catch (error) {
        console.error('Error creating meeting:', error);
        throw new Error('Failed to create meeting');
    }
};

const getAllMeetings = async () => {
    try {
        const meetings = await Meeting.find()
            .populate('scheduledBy', 'firstName lastName email') // Fetch scheduler info
            .sort({ createdAt: -1 }); // Latest first

        const detailedMeetings = await Promise.all(
            meetings.map(async (meeting) => {
                const details = await MeetingDetails.findOne({ meetingID: meeting._id })
                    .populate('participants', 'firstName lastName email') // Fetch participant details
                    .lean();

                return {
                    _id: meeting._id,
                    title: meeting.title,
                    description: meeting.description,
                    meetLink: meeting.meetLink,
                    scheduledBy: meeting.scheduledBy,
                    createdAt: meeting.createdAt,
                    updatedAt: meeting.updatedAt,
                    meetingDetails: details || {}, // Include meeting details if available
                };
            })
        );

        return { success: true, meetings: detailedMeetings };
    } catch (error) {
        console.error('Error fetching meetings:', error);
        throw new Error('Failed to fetch meetings');
    }
};


module.exports = { scheduleMeeting, getAllMeetings };
