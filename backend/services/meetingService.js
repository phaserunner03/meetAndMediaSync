// const Meeting = require('../models/Meeting');
// const MeetingDetails = require('../models/MeetingDetails');
// const { createEvent } = require('../utils/googleCalendar');

// const scheduleMeeting = async ({ title, description, participants, startTime, endTime }) => {
//     try {
//         // Create Google Calendar Event with Google Meet link
//         const event = {
//             summary: title,
//             description,
//             start: { dateTime: startTime, timeZone: 'UTC' },
//             end: { dateTime: endTime, timeZone: 'UTC' },
//             attendees: participants.map(email => ({ email })), // Assuming participants are emails
//             conferenceData: { createRequest: { requestId: `${Date.now()}` } },
//         };

//         const response = await createEvent(event);
//         if (!response || !response.hangoutLink) throw new Error('Failed to generate Google Meet link');

//         const meetLink = response.hangoutLink;

//         // Save Meeting in MongoDB
//         const newMeeting = new Meeting({
//             title,
//             description,
//             meetLink,
//             scheduledBy: participants[0], // Assuming the first participant is the scheduler
//         });

//         const savedMeeting = await newMeeting.save();

//         // Determine if the meeting is upcoming or past
//         const meetingHistory = new Date(startTime) > new Date() ? 'upcoming' : 'past';

//         // Save Meeting Details
//         const newMeetingDetails = new MeetingDetails({
//             meetingID: savedMeeting._id,
//             meetingDate: startTime,
//             meetingHistory,
//             meetingType: participants.length > 1 ? 'group' : 'one-to-one',
//             participants,
//             startTime,
//             endTime,
//         });

//         await newMeetingDetails.save();

//         return { success: true, meetLink, meetingId: savedMeeting._id };
//     } catch (error) {
//         console.error('Error scheduling meeting:', error);
//         throw new Error(error.message || 'Failed to schedule meeting');
//     }
// };

// const getAllMeetings = async () => {
//     try {
//         const meetings = await Meeting.find().sort({ createdAt: -1 });

//         const detailedMeetings = await Promise.all(
//             meetings.map(async (meeting) => {
//                 const details = await MeetingDetails.findOne({ meetingID: meeting._id }).lean();

//                 return {
//                     _id: meeting._id,
//                     title: meeting.title,
//                     description: meeting.description,
//                     meetLink: meeting.meetLink,
//                     scheduledBy: meeting.scheduledBy,
//                     createdAt: meeting.createdAt,
//                     updatedAt: meeting.updatedAt,
//                     meetingDetails: details || {}, // Include meeting details if available
//                 };
//             })
//         );

//         return { success: true, meetings: detailedMeetings };
//     } catch (error) {
//         console.error('Error fetching meetings:', error);
//         throw new Error('Failed to fetch meetings');
//     }
// };

// module.exports = { scheduleMeeting, getAllMeetings };


const Meeting = require('../models/Meeting');
const MeetingDetails = require('../models/MeetingDetails');
const { createEvent } = require('../utils/googleCalendar');

const scheduleMeeting = async ({ organizerId,title, description, participants, startTime, endTime }) => {
    try {
        // Create Google Calendar Event with Google Meet link
        const event = {
            summary: title,
            description,
            start: { dateTime: startTime, timeZone: 'UTC' },
            end: { dateTime: endTime, timeZone: 'UTC' },
            attendees: participants.map(email => ({ email })), // Assuming participants are emails
            conferenceData: { createRequest: { requestId: `${Date.now()}` } },
        };

        const response = await createEvent(event);
        if (!response || !response.hangoutLink) throw new Error('Failed to generate Google Meet link');

        const meetLink = response.hangoutLink;

        // Save Meeting in MongoDB
        const newMeeting = new Meeting({
            title,
            description,
            meetLink,
            scheduledBy: organizerId, // Assuming the first participant is the scheduler
        });

        const savedMeeting = await newMeeting.save();

        // Determine if the meeting is upcoming or past
        const meetingHistory = new Date(startTime) > new Date() ? 'upcoming' : 'past';

        // Save Meeting Details
        const newMeetingDetails = new MeetingDetails({
            meetingID: savedMeeting._id,
            meetingDate: startTime,
            meetingHistory,
            meetingType: participants.length > 1 ? 'group' : 'one-to-one',
            participants,
            startTime,
            endTime,
        });

        await newMeetingDetails.save();

        return { success: true, meetLink, meetingId: savedMeeting._id };
    } catch (error) {
        console.error('Error scheduling meeting:', error);
        throw new Error(error.message || 'Failed to schedule meeting');
    }
};

const getAllMeetings = async () => {
    try {
        const meetings = await Meeting.find().sort({ createdAt: -1 });

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
