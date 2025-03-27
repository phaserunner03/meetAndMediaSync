import mongoose, { Document } from 'mongoose';
import { Collections } from '../constants/collections.constants';

interface User extends Document {
    _id: string;
    role: { _id: mongoose.Schema.Types.ObjectId, name: string, permissions:string[] };
}

interface ValidationResult {
    success: boolean;
    message?: string;
}

const validateMeetingDetails = async (user: User, participants: string[], startTime: string, endTime: string): Promise<ValidationResult> => {
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

    await user.populate('role');
    const populatedUser = user;
    if (participants.length >= 2 && !populatedUser.role.permissions.includes("groupMeeting") ) {
        return { success: false, message: 'You can only schedule one-to-one meetings' };
    }

    const existingMeeting = await Collections.MEETING_DETAILS.findOne({
        startTime: { $gte: new Date(startTime), $lt: new Date(endTime) },
    }).populate({
        path: 'meetingID',
        match: { scheduledBy: user._id }
    });

    if (existingMeeting) {
        return { success: false, message: 'You already have a meeting scheduled at this time' };
    }

    return { success: true };
};

export default validateMeetingDetails;
