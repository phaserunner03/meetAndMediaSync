import { Request, Response } from 'express';
import * as meetingService from '../services/meetingService';
import { google } from 'googleapis';

// Extend the Request interface to include the user property
interface AuthenticatedRequest extends Request {
    user: any;
}

const scheduleMeeting = async (req: AuthenticatedRequest, res: Response) => {
    try {
        const { user } = req;
        const { title, location, description, participants, startTime, endTime } = req.body;
        const event = await meetingService.scheduleMeeting(user, title, location, description, participants, startTime, endTime);
        res.status(200).json(event);
    } catch (err) {
        if (err instanceof Error) {
            res.status(500).json({ message: err.message });
        } else {
            res.status(500).json({ message: 'An unknown error occurred' });
        }
    }
};

const getAllMeetings = async (req: AuthenticatedRequest, res: Response) => {
    try {
        const { year, month } = req.query;
        if (!year || !month) {
            return res.status(400).json({ success: false, message: "Year and month are required" });
        }
        const result = await meetingService.getAllMeetings(req.user, parseInt(year as string), parseInt(month as string));
        res.status(200).json(result);
    } catch (error) {
        if (error instanceof Error) {
            if (error instanceof Error) {
                if (error instanceof Error) {
                    res.status(500).json({ message: error.message });
                } else {
                    res.status(500).json({ message: 'An unknown error occurred' });
                }
            } else {
                res.status(500).json({ message: 'An unknown error occurred' });
            }
        } else {
            res.status(500).json({ message: 'An unknown error occurred' });
        }
    }
};

const updateMeeting = async (req: AuthenticatedRequest, res: Response) => {
    try {
        const { user } = req;
        const { eventId } = req.params;
        const updatedData = req.body;
        if (!eventId || !updatedData) {
            return res.status(400).json({ success: false, message: "Event ID and updated data are required" });
        }
        const result = await meetingService.modifyMeeting(user, eventId, updatedData);
        res.status(200).json(result);
    } catch (err) {
        if (err instanceof Error) {
            res.status(500).json({ message: err.message });
        } else {
            res.status(500).json({ message: 'An unknown error occurred' });
        }
    }
};

const deleteMeeting = async (req: AuthenticatedRequest, res: Response) => {
    try {
        const { user } = req;
        const { eventId } = req.params;
        if (!eventId) {
            return res.status(400).json({ success: false, message: "Event ID is required" });
        }
        const result = await meetingService.removeMeeting(user, eventId);
        res.status(200).json(result);
    } catch (err) {
        if (err instanceof Error) {
            res.status(500).json({ message: err.message });
        } else {
            res.status(500).json({ message: 'An unknown error occurred' });
        }
    }
};

async function authorize(payload: any) {
    let client = google.auth.fromJSON(payload);
    if (client) return client;
}

const test = async (req: Request, res: Response) => {
    try {
        const refreshToken = "1//0gyqD_rNDZbWGCgYIARAAGBASNwF-L9IrmCxmPuKYJsyy5ovaGyJQCk66iU3bV7S0nv1mp5Nyfl8F0HeRxbsRHsOQnj4Prt6MOh8";
        const payload = {
            type: 'authorized_user',
            client_id: process.env.GOOGLE_CLIENT_ID!,
            client_secret: process.env.GOOGLE_CLIENT_SECRET!,
            refresh_token: refreshToken,
        };

        const auth = await authorize(payload);
        const calendar = google.calendar({ version: 'v3', auth: auth as any });

        const response = await calendar.freebusy.query({
            requestBody: {
                timeMin: "2025-03-01T12:01:00Z",
                timeMax: "2025-03-01T14:30:00Z",
                timeZone: "UTC",
                items: [{ id: "primary" }],
            },
        });

        const calendars = response.data.calendars;
        if (!calendars || !calendars.primary) {
            return res.status(500).json({ success: false, message: 'Error in checking user availability' });
        }
        const busySlots = calendars.primary.busy;
        return res.status(200).json({ success: true, available: busySlots ? !busySlots.length : true });
    } catch (err) {
        res.status(500).json({ success: false, message: 'Error in checking user availability' });
    }
};

export { scheduleMeeting, getAllMeetings, updateMeeting, deleteMeeting, test };
