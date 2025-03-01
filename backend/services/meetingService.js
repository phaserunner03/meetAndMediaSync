const Meeting = require('../models/Meeting');
const MeetingDetails = require('../models/MeetingDetails');
const { createEvent } = require('../utils/googleCalendar');
const { v4: uuid } = require('uuid');
const validateMeetingDetails = require('../utils/meetingValidation');

const scheduleMeeting = async ( user, title,location ,description, participants, startTime, endTime ) => {
    try {
        const validation = await validateMeetingDetails(user, participants, startTime, endTime);
        if (!validation.success) {
            return { success: false, message: validation.message }; 
        }
        const isAvailable = await checkUserAvailability(user.refreshToken, startTime, endTime);
        if (!isAvailable) {
            return { success: false, message: 'User is not available at the specified time' };
        }

        const event = {
            'summary': title,
            'location': location,
            'description': description,
            'start': {
              'dateTime': startTime,
              'timeZone': 'UTC',
            },
            'end': {
              'dateTime': endTime,
              'timeZone': 'UTC',
            },
            colorId: 1,
    conferenceData: {
        createRequest: {
            requestId: uuid(),
        }
    },
            'attendees': participants.map((participant) => ({ email: participant })),
            'reminders': {
              'useDefault': false,
              'overrides': [
                {'method': 'email', 'minutes': 24 * 60},
                {'method': 'popup', 'minutes': 10},
              ],
            },
          };

        const response = await createEvent(user.refreshToken, event);
        if (!response || !response.hangoutLink) throw new Error('Failed to generate Google Meet link');
        const meetLink = response.hangoutLink;

        // Save Meeting in MongoDB
        const newMeeting = new Meeting({
            title,
            location,
            description,
            meetLink,
            scheduledBy: user._id,
        });
        const savedMeeting = await newMeeting.save();
        const meetingHistory = new Date(startTime) > new Date() ? 'upcoming' : 'past';
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
        return {success:true, message: 'Meeting scheduled successfully', meetLink: meetLink};
    } catch (error) {
        console.error('Error scheduling meeting:', error);
        throw new Error(error.message || 'Failed to schedule meeting');
    }
};

const getAllMeetings = async (user) => {
    try {
        const meetings = await Meeting.find({ scheduledBy: user._id }).sort({ createdAt: -1 });

        const detailedMeetings = await Promise.all(
            meetings.map(async (meeting) => {
                const details = await MeetingDetails.findOne({ meetingID: meeting._id }).lean();

                return {
                    _id: meeting._id,
                    title: meeting.title,
                    description: meeting.description,
                    meetLink: meeting.meetLink,
                    scheduledBy: meeting.scheduledBy,
                    createdAt: meeting.createdAt,
                    updatedAt: meeting.updatedAt,
                    meetingDetails: details || {},
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