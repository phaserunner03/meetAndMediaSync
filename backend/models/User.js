const mongoose = require("mongoose");

const UserSchema = new mongoose.Schema({
    googleId: { type: String, unique: true },
    displayName: { type: String },
    email: { type: String, required: true, unique: true },
    role: { type: mongoose.Schema.Types.ObjectId, ref: 'Role', required: true },
    photoURL: { type: String },
    accessToken: { type: String },
    refreshToken: { type: String },
});

module.exports = mongoose.model("User", UserSchema);
