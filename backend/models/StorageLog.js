const mongoose = require('mongoose');

const StorageLogSchema = new mongoose.Schema({
    meetingID: { type: mongoose.Schema.Types.ObjectId, ref: 'Meeting', required: true },
    fileName: { type: String, required: true },
    storedIn: { type: String, enum: ['Google Drive', 'GCP'], required: true },
    fileUrl: { type: String, required: true },
    transferredAt: { type: Date, required: true },
    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now }
  }, { timestamps: true });

module.exports = mongoose.model('StorageLog', StorageLogSchema);
