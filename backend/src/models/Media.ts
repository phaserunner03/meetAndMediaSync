import mongoose, { Document, Schema } from 'mongoose';

interface MediaDocument extends Document {
    meetingID: Schema.Types.ObjectId;
    type: 'screenshot' | 'recording';
    fileUrl: string;
    storedIn: 'Google Drive' | 'GCP';
    movedToGCP: boolean;
    timestamp: Date;
    createdAt: Date;
    updatedAt: Date;
}

const MediaSchema = new mongoose.Schema({
    meetingID: { type: mongoose.Schema.Types.ObjectId, ref: 'Meeting', required: true },
    type: { type: String, enum: ['screenshot', 'recording'], default:"screenshot", required: true },
    fileUrl: { type: String, required: true },
    fileName: { type: String, required: true },
    storedIn: { type: String, enum: ['Google Drive', 'GCP'],default:"Google Drive", required: true },
    movedToGCP: { type: Boolean, default: false },
    timestamp: { type: Date, required: true },
    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now }
}, { timestamps: true });

export default mongoose.model<MediaDocument>('Media', MediaSchema);
