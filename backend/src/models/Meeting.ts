import mongoose, { Document, Schema } from 'mongoose';

interface MeetingDocument extends Document {
    title: string;
    description: string;
    location: string;
    meetLink: string;
    scheduledBy: Schema.Types.ObjectId;
    createdAt: Date;
    updatedAt: Date;
}

const MeetingSchema = new mongoose.Schema({
    title: { type: String, required: true },
    description: { type: String },
    location: { type: String },
    meetLink: { type: String, required: true },
    scheduledBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now }
}, { timestamps: true });

export default mongoose.model<MeetingDocument>('Meeting', MeetingSchema);
