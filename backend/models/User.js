

const mongoose = require("mongoose");

const UserSchema = new mongoose.Schema({
    googleId: { type: String, required: true, unique: true },
    displayName: { type: String },
    email: { type: String, required: true, unique: true },
<<<<<<< HEAD
    role: { type: String, enum: ["user", "admin"], default: "user" },
=======
    role: { type: String, enum: ['ADMIN', 'user'], required: true, default: 'user' },
>>>>>>> 1b2bbb39d08efae3c31f453b7805590c3051af7d
    photoURL: { type: String },
    accessToken: { type: String },
    refreshToken: { type: String },
});

module.exports = mongoose.model("User", UserSchema);


// const mongoose = require('mongoose');

// const UserSchema = new mongoose.Schema({
//   email: { type: String, required: true, unique: true },
//   password: { type: String, required: true },
//   firstName: { type: String, required: true },
//   lastName: { type: String, required: true },
//   profilePic: { type: String },
//   role: { type: String, enum: ['organiser', 'user'], required: true, default: 'user' },
//   isAdmin: { type: Boolean, default: false },
//   isDeleted: { type: Boolean, default: false },
//   createdAt: { type: Date, default: Date.now },
//   updatedAt: { type: Date, default: Date.now }
// }, { timestamps: true });


// module.exports = mongoose.model('User', UserSchema);
