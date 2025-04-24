import User from "../models/User";
import Meeting from "../models/Meeting";
import MeetingDetails from "../models/MeetingDetails";
import Role from "../models/Role"
import Media from "../models/Media";
import StorageLog from "../models/StorageLog";

export const Collections = {
    USER: User,
    MEETINGS: Meeting,
    ROLE: Role,
    MEETING_DETAILS: MeetingDetails,
    MEDIA: Media,
    STORAGE_LOG: StorageLog,
} ;
export enum Resources{
    USER = "User",
    MEETINGS="Meeting",
    ROLE = "Role",
    MEETING_DETAILS="Meeting Details",
    MEDIA="Media",
    STORAGE_LOG="Storage Log",
}
