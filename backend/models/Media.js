const mongoose = require('mongoose');

const MediaSchema = new mongoose.Schema({
    meetingID: { type: mongoose.Schema.Types.UUID, ref: 'Meeting', required: true },
    type: { type: String, enum: ['screenshot', 'recording'], required: true },
    fileUrl: { type: String, required: true },
    storedIn: { type: String, enum: ['Google Drive', 'GCP'], required: true },
    movedToGCP: { type: Boolean, default: false },
    timestamp: { type: Date, required: true },
    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now }
    }, { timestamps: true });

module.exports = mongoose.model('Media', MediaSchema);
