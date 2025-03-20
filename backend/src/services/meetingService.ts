import mongoose, { Document } from 'mongoose';
import { v4 as uuid } from 'uuid';
import Meeting from '../models/Meeting';
import MeetingDetails from '../models/MeetingDetails';
import { createEvent, listEvents, checkUserAvailability, updateEvent, deleteEvent } from '../utils/googleCalendar';
import validateMeetingDetails from '../utils/meetingValidation';

interface User extends Document {
    _id: string;
    role: { _id: mongoose.Schema.Types.ObjectId, name: string, permissions:string[] };
    refreshToken: string;
}

interface MeetingResponse {
    success: boolean;
    message?: string;
    meetLink?: string;
    updatedEvent?: any;
}

const scheduleMeeting = async (user: User, title: string, location: string, description: string, participants: string[], startTime: string, endTime: string): Promise<MeetingResponse> => {
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
            summary: title,
            location: location,
            description: description,
            start: {
                dateTime: startTime,
                timeZone: 'Asia/Kolkata',
            },
            end: {
                dateTime: endTime,
                timeZone: 'Asia/Kolkata',
            },
            colorId: '1',
            conferenceData: {
                createRequest: {
                    requestId: uuid(),
                }
            },
            attendees: participants.map((participant) => ({ email: participant })),
            reminders: {
                useDefault: false,
                overrides: [
                    { method: 'email', minutes: 24 * 60 },
                    { method: 'popup', minutes: 10 },
                ],
            },
            extendedProperties: {
                private: { source: "CloudCapture" },
            }
        };

        const response = await createEvent(user.refreshToken, event);
        if (!response || !response.hangoutLink) throw new Error('Failed to generate Google Meet link');
        const meetLink = response.hangoutLink;

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
        throw new Error(error instanceof Error ? error.message : 'Failed to schedule meeting');
    }
};

const getAllMeetings = async (user: User, year: number, month: number) => {
    try {
        const googleMeetings = await listEvents(user.refreshToken, year, month);
        const platformMeetings = await Meeting.find({ scheduledBy: user._id }).lean();

        const ourMeetings = googleMeetings.filter(meeting =>
            meeting.extendedProperties?.private?.source === "CloudCapture"
        );

        const allMeetings = googleMeetings.map((event) => ({
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
            location: event.location,
        }));

        return {
            success: true,
            ourMeetings,
            allMeetings,
            platformMeetings,
        };
    } catch (error) {
        console.error("Error fetching meetings:", error);
        throw new Error("Failed to fetch meetings");
    }
};

const modifyMeeting = async (user: User, eventId: string, updatedData: any): Promise<MeetingResponse> => {
    try {

        const formattedData = {
            summary: updatedData.title,
            location: updatedData.location,
            description: updatedData.description,
            start: {
                dateTime: updatedData.startTime,
                timeZone: "Asia/Kolkata",
            },
            end: {
                dateTime: updatedData.endTime,
                timeZone: "Asia/Kolkata",
            },
            attendees: updatedData.participants.map((participant: string) => ({ email: participant })),
        };
        
        const updatedEvent = await updateEvent(user.refreshToken, eventId, formattedData);
        if ('success' in updatedEvent && !updatedEvent.success) {
            return { success: false, message: updatedEvent.message || 'Failed to update meeting' };
        }

        return { success: true, message: 'Meeting updated successfully', updatedEvent };

    } catch (error) {
        console.error('Error updating meeting:', error);
        throw new Error('Failed to update meeting');
    }
};

const removeMeeting = async (user: User, eventId: string): Promise<MeetingResponse> => {
    try {
        const result = await deleteEvent(user.refreshToken, eventId);
        return result;
    } catch (error) {
        console.error('Error deleting meeting:', error);
        throw new Error('Failed to delete meeting');
    }
};

export { scheduleMeeting, getAllMeetings, modifyMeeting, removeMeeting };
