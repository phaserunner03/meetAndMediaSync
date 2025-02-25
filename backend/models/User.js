import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
  {
    uid: { type: String, required: true, unique: true },
    displayName: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    photoURL: { type: String },
  },
  { timestamps: true }
);

const User = mongoose.model("User", userSchema);
export default User;

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
