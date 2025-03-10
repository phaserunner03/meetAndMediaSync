import mongoose, { Document, Schema } from 'mongoose';

interface NotificationDocument extends Document {
    userID: Schema.Types.ObjectId;
    message: string;
    type: 'email' | 'push notification';
    status: 'success' | 'failed';
    createdAt: Date;
}

const NotificationSchema = new mongoose.Schema({
    userID: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    message: { type: String, required: true },
    type: { type: String, enum: ['email', 'push notification'], required: true },
    status: { type: String, enum: ['success', 'failed'], required: true },
    createdAt: { type: Date, default: Date.now },
}, { timestamps: true });

export default mongoose.model<NotificationDocument>('Notification', NotificationSchema);
