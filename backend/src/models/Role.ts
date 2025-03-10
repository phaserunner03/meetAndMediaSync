import mongoose, { Document } from "mongoose";

interface RoleDocument extends Document {
    name: string;
    permissions: string[];
}

const RoleSchema = new mongoose.Schema({
    name: { type: String, required: true, unique: true },
    permissions: { type: [String], required: true },
});

export default mongoose.model<RoleDocument>("Role", RoleSchema);
