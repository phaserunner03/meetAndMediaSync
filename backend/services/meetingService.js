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
const { createEvent, listEvents, checkUserAvailability, updateEvent, deleteEvent } = require('../utils/googleCalendar');
const { v4: uuid } = require('uuid');
const validateMeetingDetails = require('../utils/meetingValidation');

const scheduleMeeting = async ( user, title, location, description, participants, startTime, endTime ) => {
    try {
        // Create Google Calendar Event with Google Meet link
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
                'timeZone': 'Asia/Kolkata',
            },
            'end': {
                'dateTime': endTime,
                'timeZone': 'Asia/Kolkata',
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
                    { 'method': 'email', 'minutes': 24 * 60 },
                    { 'method': 'popup', 'minutes': 10 },
                ],
            },
            'extendedProperties': {
                'private': { 'source': "CloudCapture" },  
            }
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
        return { success: true, message: 'Meeting scheduled successfully', meetLink: meetLink };
    } catch (error) {
        console.error('Error scheduling meeting:', error);
        throw new Error(error.message || 'Failed to schedule meeting');
    }
};


const getAllMeetings = async (user,year, month) => {
    try {
        
        const googleMeetings = await listEvents(user.refreshToken,year,month); // Fetch all meetings from Google Calendar
        const platformMeetings = await Meeting.find({ scheduledBy: user._id }).lean(); // Fetch only our platform meetings

        // Separate meetings based on `source` field
        const ourMeetings = googleMeetings.filter(meeting =>
            meeting.extendedProperties?.private?.source === "CloudCapture"
        );

        const allMeetings = googleMeetings.map((event)=>
        ({
            id: event.id,
            title: event.summary || "No Title",
            description: event.description || "No Description",
            meetLink: event.hangoutLink || "No Link",
            meetingDate: event.start,
            startTime: event.start,
            endTime: event.end,
            meetingType: event.attendees && event.attendees.length > 1 ? 'group' : 'one to one',
            participants: event.attendees ? event.attendees.map(a => a.email) : [],
            extendedProperties: event.extendedProperties || {},
        })
        ); // Contains all meetings

        return {
            success: true,
            ourMeetings,  // Only CloudCapture meetings
            allMeetings,  // All Google Calendar meetings (including external ones)
            platformMeetings, // Extra: Meetings from our MongoDB for verification
        };
    } catch (error) {
        console.error("Error fetching meetings:", error);
        throw new Error("Failed to fetch meetings");
    }
};

// Update a meeting
const modifyMeeting = async (user, eventId, updatedData) => {
    try {
        const formattedData = {
            ...updatedData,
            summary:updatedData.title
        }
        delete formattedData.title
        const updatedEvent = await updateEvent(user.refreshToken, eventId, formattedData);
        return { success: true, message: 'Meeting updated successfully', updatedEvent };
    } catch (error) {
        console.error('Error updating meeting:', error);
        throw new Error('Failed to update meeting');
    }
};

// Delete a meeting
const removeMeeting = async (user, eventId) => {
    try {
        const result = await deleteEvent(user.refreshToken, eventId);
        return result;
    } catch (error) {
        console.error('Error deleting meeting:', error);
        throw new Error('Failed to delete meeting');
    }
};

module.exports = { scheduleMeeting, getAllMeetings, modifyMeeting, removeMeeting };