const mongoose = require('mongoose');

const MeetingDetailsSchema = new mongoose.Schema({
    meetingID: { type: mongoose.Schema.Types.UUID, ref: 'Meeting', required: true },
    meetingDate: { type: Date, required: true },
    meetingHistory: { type: String, enum: ['upcoming', 'past'], required: true },
    meetingType: { type: String, enum: ['one to one', 'group'], required: true },
    participants: { type: [String], ref: 'User' },
    startTime: { type: Date, required: true },
    endTime: { type: Date },
    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now }
  }, { timestamps: true });
  

module.exports = mongoose.model('MeetingDetails', MeetingDetailsSchema);

