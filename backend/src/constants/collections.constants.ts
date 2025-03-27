import User from "../models/User";
import Meeting from "../models/Meeting";
import MeetingDetails from "../models/MeetingDetails";
import Role from "../models/Role"

export const Collections = {
    USER: User,
    MEETINGS: Meeting,
    ROLE: Role,
    MEETING_DETAILS: MeetingDetails,
} ;
export enum Resources{
    USER = "User",
    MEETINGS="Meeting",
    ROLE = "Role",
    MEETING_DETAILS="Meeting Details"
}
