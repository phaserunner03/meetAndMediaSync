const mongoose = require('mongoose');

const MeetingSchema = new mongoose.Schema({
    meetingID: { type: mongoose.Schema.Types.UUID, default: () => new mongoose.Types.ObjectId() },
    title: { type: String, required: true },
    description: { type: String },
    meetLink: { type: String, required: true },
    scheduledBy: { type: String, ref: 'User', required: true },
    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now }
  }, { timestamps: true });

module.exports = mongoose.model('Meeting', MeetingSchema);
