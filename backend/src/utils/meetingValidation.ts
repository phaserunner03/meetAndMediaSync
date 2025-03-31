import mongoose, { Document } from "mongoose";
import { Collections } from "../constants/collections.constants";
import { User } from "../constants/types.constants";
import logger from "./logger";
import { StatusCodes } from "../constants/status-codes.constants";
import { Permissions } from "../constants/permissions.constants";
const functionName = { validateMeetingDetails: "validateMeetingDetails" };
const validateMeetingDetails = async (
  user: User,
  participants: string[],
  startTime: string,
  endTime: string
) => {
  try {
    const now = new Date();
    const start = new Date(startTime);
    const end = new Date(endTime);
    if (start < now) {
      logger.warn({
        functionName: functionName.validateMeetingDetails,
        statusCode: StatusCodes.BAD_REQUEST,
        message: "Meeting cannot be scheduled in the past",
        data: { startTime },
      });

      return {
        success: false,
        message: "Meeting cannot be scheduled in the past",
      };
    }

    if (start > end) {
      logger.warn({
        functionName: functionName.validateMeetingDetails,
        statusCode: StatusCodes.BAD_REQUEST,
        message: "End time cannot be before start time",
        data: { startTime, endTime },
      });

      return {
        success: false,
        message: "End time cannot be before start time",
      };
    }

    if (participants.length < 1) {
      logger.warn({
        functionName: functionName.validateMeetingDetails,
        statusCode: StatusCodes.BAD_REQUEST,
        message: "At least one participant is required",
        data: { participants },
      });

      return {
        success: false,
        message: "At least one participant is required",
      };
    }

    await user.populate("role");
    const populatedUser = user;
    if (
      participants.length >= 2 &&
      !populatedUser.role.permissions.includes(Permissions.GROUP_MEETING)
    ) {
      logger.warn({
        functionName: functionName.validateMeetingDetails,
        statusCode: StatusCodes.FORBIDDEN,
        message: "User does not have permission for group meetings",
        data: { userId: user._id, role: user.role.name },
      });
      return {
        success: false,
        message: "You can only schedule one-to-one meetings",
      };
    }

    const existingMeeting = await Collections.MEETING_DETAILS.findOne({
      startTime: { $gte: new Date(startTime), $lt: new Date(endTime) },
    }).populate({
      path: "meetingID",
      match: { scheduledBy: user._id },
    });

    if (existingMeeting) {
        logger.warn({
            functionName: functionName.validateMeetingDetails,
            statusCode: StatusCodes.CONFLICT,
            message: "User already has a meeting scheduled at this time",
            data: { userId: user._id, existingMeetingId: existingMeeting._id },
          });
      return {
        success: false,
        message: "You already have a meeting scheduled at this time",
      };
    }
    logger.info({
        functionName: functionName.validateMeetingDetails,
        statusCode: StatusCodes.OK,
        message: "Meeting validation successful",
        data: { userId: user._id, participants, startTime, endTime },
      });
    return { success: true, message: "Meeting validation successful" };
  } catch (error) {
    logger.error({
        functionName: functionName.validateMeetingDetails,
        statusCode: StatusCodes.INTERNAL_SERVER_ERROR,
        message: "Error validating meeting details",
        data: { data: { error: error instanceof Error ? error.message : "Unknown error" }, },
      });
  
      return { success: false, message: "Internal server error" };
  }
};

export default validateMeetingDetails;
