import mongoose, { Document } from "mongoose";
import { v4 as uuid } from "uuid";
import {
  createEvent,
  listEvents,
  checkUserAvailability,
  updateEvent,
  deleteEvent,
} from "../utils/googleCalendar";
import validateMeetingDetails from "../utils/meetingValidation";
import { google } from "googleapis";
import { Collections } from "../constants/collections.constants";
import { User, MeetingResponse } from "../constants/types.constants";
import logger from "../utils/logger";
import { StatusCodes } from "../constants/status-codes.constants";

const functionName = {
  scheduleMeeting: "scheduleMeeting",
  getAllMeetings: "getAllMeetings",
  modifyMeeting: "modifyMeeting",
  removeMeeting: "removeMeeting",
  verifyMeeting: "verifyMeeting",
};

const scheduleMeeting = async (
  user: User,
  title: string,
  location: string,
  description: string,
  participants: string[],
  startTime: string,
  endTime: string
): Promise<MeetingResponse> => {
  try {
    const validation = await validateMeetingDetails(
      user,
      participants,
      startTime,
      endTime
    );
    if (!validation.success) {
      return { success: false, message: validation.message };
    }

    const isAvailable = await checkUserAvailability(
      user.refreshToken,
      startTime,
      endTime
    );
    if (!isAvailable) {
      return {
        success: false,
        message: "User is not available at the specified time",
      };
    }

    const event = createMeetingEvent(
      title,
      location,
      description,
      participants,
      startTime,
      endTime
    );
    const response = await createEvent(user.refreshToken, event);
    if (!response?.hangoutLink)
      throw new Error("Failed to generate Google Meet link");
    const meetLink = response.hangoutLink;
    await saveMeetingDetails(
      user._id,
      title,
      location,
      description,
      meetLink,
      startTime,
      endTime,
      participants
    );
    logger.info({
      functionName: functionName.scheduleMeeting,
      statusCode: StatusCodes.OK,
      message: "Meeting scheduled successfully",
      data: { meetLink },
    });
    return {
      success: true,
      message: "Meeting scheduled successfully",
      meetLink,
    };
  } catch (error) {
    logger.error({
      functionName: functionName.scheduleMeeting,
      statusCode: StatusCodes.INTERNAL_SERVER_ERROR,
      message: "Error scheduling meeting",
      data: { error: error instanceof Error ? error.message : "Unknown error" },
    });
    throw new Error("Failed to schedule meeting");
  }
};

const getAllMeetings = async (user: User, year: number, month: number) => {
  try {
    logger.info({
      functionName: functionName.getAllMeetings,
      message: "Fetching Google Calendar meetings",
    });
    const googleMeetings = await listEvents(user.refreshToken, year, month);
    const platformMeetings = await Collections.MEETINGS.find({
      scheduledBy: user._id,
    }).lean();

    const ourMeetings = googleMeetings.filter(
      (meeting) =>
        meeting.extendedProperties?.private?.source === "CloudCapture"
    );

    const allMeetings = formatMeetings(googleMeetings);

    logger.info({
      functionName: functionName.getAllMeetings,
      statusCode: StatusCodes.OK,
      message: "Meetings fetched successfully",
    });

    return { success: true, ourMeetings, allMeetings, platformMeetings };
  } catch (error) {
    logger.error({
      functionName: functionName.getAllMeetings,
      statusCode: StatusCodes.INTERNAL_SERVER_ERROR,
      message: "Error fetching meetings",
      data: { error: error instanceof Error ? error.message : "Unknown error" },
    });
    throw new Error("Failed to fetch meetings");
  }
};

const modifyMeeting = async (
  user: User,
  eventId: string,
  updatedData: any
): Promise<MeetingResponse> => {
  try {
    logger.info({
      functionName: functionName.modifyMeeting,
      statusCode: StatusCodes.OK,
      message: "Modifying meeting details",
      data: { eventId },
    });
    const formattedData = formatMeetings(updatedData);
    const updatedEvent = await updateEvent(
      user.refreshToken,
      eventId,
      formattedData
    );
    if ("success" in updatedEvent && !updatedEvent.success) {
      return {
        success: false,
        message: updatedEvent.message || "Failed to update meeting",
      };
    }
    logger.info({
      functionName: functionName.modifyMeeting,
      statusCode: StatusCodes.OK,
      message: "Meeting updated successfully",
      data: { eventId },
    });

    return {
      success: true,
      message: "Meeting updated successfully",
      updatedEvent,
    };
  } catch (error) {
    logger.error({
      functionName: functionName.modifyMeeting,
      statusCode: StatusCodes.INTERNAL_SERVER_ERROR,
      message: "Error updating meeting",
      data: { error: error instanceof Error ? error.message : "Unknown error" },
    });
    throw new Error("Failed to update meeting");
  }
};

const removeMeeting = async (
  user: User,
  eventId: string
): Promise<MeetingResponse> => {
  try {
    const result = await deleteEvent(user.refreshToken, eventId);
    logger.info({
      functionName: functionName.removeMeeting,
      statusCode: StatusCodes.OK,
      message: "Deleted meeting",
      data: { eventId },
    });
    return result;
  } catch (error) {
    logger.error({
      functionName: functionName.removeMeeting,
      statusCode: StatusCodes.INTERNAL_SERVER_ERROR,
      message: "Error deleting meeting",
      data: { error: error instanceof Error ? error.message : "Unknown error" },
    });
    throw new Error("Failed to delete meeting");
  }
};

const verifyMeeting = async (meetingCode: string, token: string) => {
  try {
    if (!token || !meetingCode) {
        throw { status: 400, message: "Token and meeting code are required" };
    }
    const oauth2Client = new google.auth.OAuth2();
    oauth2Client.setCredentials({ access_token: token });
    const oauth2 = google.oauth2({ version: "v2", auth: oauth2Client });

    const { data } = await oauth2.userinfo.get();
    if (!data.id) {
        throw { status: 401, message: "Invalid token" };
    }
    const user = await getUserFromToken(token);

    const meetingLink = `https://meet.google.com/${meetingCode}`;
    const meeting = await Collections.MEETINGS.findOne({
      meetLink: meetingLink,
      scheduledBy: user._id,
    });

    if (!meeting) {
      throw {
        status: StatusCodes.FORBIDDEN,
        message: "Meeting not created using CloudCapture",
      };
    }
    logger.info({
      functionName: functionName.verifyMeeting,
      statusCode: StatusCodes.OK,
      message: "Meeting verified successfully",
      data: { meetingCode },
    });

    return { success: true, message: "Authorized" };
  } catch (error) {
    logger.error({ functionName: functionName.verifyMeeting, statusCode:StatusCodes.INTERNAL_SERVER_ERROR, message: "Error verifying meeting", data: { error: error instanceof Error ? error.message : "Unknown error" }, });
    throw new Error("Failed to verify meeting");

  }
};

async function getUserFromToken(token: string) {
  const oauth2Client = new google.auth.OAuth2();
  oauth2Client.setCredentials({ access_token: token });

  const oauth2 = google.oauth2({ version: "v2", auth: oauth2Client });
  const { data } = await oauth2.userinfo.get();

  if (!data.id) {
    throw { status: StatusCodes.UNAUTHORIZED, message: "Invalid token" };
  }

  const user = await Collections.USER.findOne({ googleId: data.id });
  if (!user) {
    throw { status: StatusCodes.NOT_FOUND, message: "User not found" };
  }

  return user;
}

async function saveMeetingDetails(
  scheduledBy: string,
  title: string,
  location: string,
  description: string,
  meetLink: string,
  startTime: string,
  endTime: string,
  participants: string[]
) {
  const meeting = new Collections.MEETINGS({
    title,
    location,
    description,
    meetLink,
    scheduledBy,
  });
  const savedMeeting = await meeting.save();
  const meetingHistory = new Date(startTime) > new Date() ? "upcoming" : "past";

  const meetingDetails = new Collections.MEETING_DETAILS({
    meetingID: savedMeeting._id,
    meetingDate: startTime,
    meetingHistory,
    meetingType: participants.length > 1 ? "group" : "one to one",
    participants,
    startTime,
    endTime,
  });

  await meetingDetails.save();
  return savedMeeting;
}

function createMeetingEvent(
  title: string,
  location: string,
  description: string,
  participants: string[],
  startTime: string,
  endTime: string
) {
  return {
    summary: title,
    location,
    description,
    start: { dateTime: startTime, timeZone: "Asia/Kolkata" },
    end: { dateTime: endTime, timeZone: "Asia/Kolkata" },
    colorId: "1",
    conferenceData: { createRequest: { requestId: uuid() } },
    attendees: participants.map((email) => ({ email })),
    reminders: {
      useDefault: false,
      overrides: [
        { method: "email", minutes: 24 * 60 },
        { method: "popup", minutes: 10 },
      ],
    },
    extendedProperties: { private: { source: "CloudCapture" } },
  };
}

function formatMeetings(updatedData: any) {
  return {
    summary: updatedData.title,
    location: updatedData.location,
    description: updatedData.description,
    start: { dateTime: updatedData.startTime, timeZone: "Asia/Kolkata" },
    end: { dateTime: updatedData.endTime, timeZone: "Asia/Kolkata" },
    attendees: updatedData.participants.map((email: string) => ({ email })),
  };
}
export {
  scheduleMeeting,
  getAllMeetings,
  modifyMeeting,
  removeMeeting,
  verifyMeeting,
};
