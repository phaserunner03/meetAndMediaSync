import mongoose, { Document, Schema } from 'mongoose';

interface StorageLogDocument extends Document {
    meetingID: Schema.Types.ObjectId;
    fileName: string;
    storedIn: 'Google Drive' | 'GCP';
    fileUrl: string;
    transferredAt: Date;
    createdAt: Date;
    updatedAt: Date;
}

const StorageLogSchema = new mongoose.Schema({
    meetingID: { type: mongoose.Schema.Types.ObjectId, ref: 'Meeting', required: true },
    fileName: { type: String, required: true },
    storedIn: { type: String, enum: ['Google Drive', 'GCP'], required: true },
    fileUrl: { type: String, required: true },
    transferredAt: { type: Date, required: true },
    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now }
}, { timestamps: true });

export default mongoose.model<StorageLogDocument>('StorageLog', StorageLogSchema);
