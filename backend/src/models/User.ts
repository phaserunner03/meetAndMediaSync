import mongoose, { Document, Schema } from "mongoose";

interface UserDocument extends Document {
    googleId: string;
    displayName: string;
    email: string;
    role: Schema.Types.ObjectId;
    photoURL: string;
    accessToken: string;
    refreshToken: string;
}

const UserSchema = new mongoose.Schema({
    googleId: { type: String, unique: true, sparse: true },
    displayName: { type: String },
    email: { type: String, required: true, unique: true },
    role: { type: mongoose.Schema.Types.ObjectId, ref: 'Role', required: true },
    photoURL: { type: String },
    accessToken: { type: String },
    refreshToken: { type: String },
});

export default mongoose.model<UserDocument>("User", UserSchema);
