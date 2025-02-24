const mongoose = require('mongoose');

const NotificationSchema = new mongoose.Schema({
    userID: { type: String, ref: 'User', required: true },
    message: { type: String, required: true },
    type: { type: String, enum: ['email', 'push notification'], required: true },
    status: { type: String, enum: ['success', 'failed'], required: true },
    createdAt: { type: Date, default: Date.now },
  }, { timestamps: true });

module.exports = mongoose.model('Notification', NotificationSchema);

