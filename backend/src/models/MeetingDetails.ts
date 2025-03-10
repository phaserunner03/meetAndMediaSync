import mongoose, { Document, Schema } from 'mongoose';

interface MeetingDetailsDocument extends Document {
    meetingID: Schema.Types.ObjectId;
    meetingDate: Date;
    meetingHistory: 'upcoming' | 'past';
    meetingType: 'one to one' | 'group';
    participants: string[];
    startTime: Date;
    endTime: Date;
    createdAt: Date;
    updatedAt: Date;
}

const MeetingDetailsSchema = new mongoose.Schema({
    meetingID: { type: mongoose.Schema.Types.ObjectId, ref: 'Meeting', required: true },
    meetingDate: { type: Date, required: true },
    meetingHistory: { type: String, enum: ['upcoming', 'past'], required: true },
    meetingType: { type: String, enum: ['one to one', 'group'], required: true },
    participants: [{ type: String, required: true }],
    startTime: { type: Date, required: true },
    endTime: { type: Date },
    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now }
}, { timestamps: true });

export default mongoose.model<MeetingDetailsDocument>('MeetingDetails', MeetingDetailsSchema);
