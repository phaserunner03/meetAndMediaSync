import { Request, Response } from 'express';
import * as meetingService from '../services/meetingService';
import { google } from "googleapis";
import Meeting from '../models/Meeting';
import User from "../models/User"

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

const test = async (req: Request, res: Response) => {
    try{
    const { meetingCode, token } = req.body;
    if (!token || !meetingCode) {
        return res.status(400).json({ success: false, message: "Missing parameters" });
    }
    const oauth2Client = new google.auth.OAuth2();
    oauth2Client.setCredentials({ access_token: token });
    const oauth2 = google.oauth2({ version: "v2", auth: oauth2Client });

    const { data } = await oauth2.userinfo.get();
    if (!data.id) {
        return res.status(401).json({ success: false, message: "Invalid token" });
    }

    const userId = data.id; 
    console.log("🔹 Verified User ID:", userId);

    const user = await User.findOne({ googleId:userId });
        if (!user) {
            return res.status(404).json({ success: false, message: "User not found" });
        }


    const meetingLink = `https://meet.google.com/${meetingCode}`
    const meeting = await Meeting.findOne({ meetLink: meetingLink, scheduledBy: user._id });
    if (meeting) {
        return res.json({ success: true, message: "Authorized" });
    } else {
        return res.status(403).json({ success: false, message: "Unauthorized" });
    }
}
catch (error) {
    console.error("❌ Error:", error);
    return res.status(500).json({ success: false, message: "Server error" });
}
};

const verifyMeeting = async (req: Request, res: Response) => {
    try {
        const { meetingCode, token } = req.body;
        const result = await meetingService.verifyMeeting(meetingCode, token);
        return res.json(result);
    } catch (error: any) {
        console.error("❌ Error:", error);
        return res.status(error.status || 500).json({ success: false, message: error.message || "Server error" });
    }
};

export { scheduleMeeting, getAllMeetings, updateMeeting, deleteMeeting, test, verifyMeeting};
