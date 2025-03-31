import { Request, Response } from "express";
import * as meetingService from "../services/meetingService";
import { google } from "googleapis";
import { Collections } from "../constants/collections.constants";
import { StatusCodes } from "../constants/status-codes.constants";
import {
  ErrorResponseMessages,
  SuccessResponseMessages,
} from "../constants/service-messages.constants";

interface AuthenticatedRequest extends Request {
  user: any;
}

const scheduleMeeting = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { user } = req;
    const { title, location, description, participants, startTime, endTime } =
      req.body;
    if (!user) {
      return res.status(StatusCodes.UNAUTHORIZED).json({
        success: false,
        message: ErrorResponseMessages.UNAUTHORIZED,
        data: {},
      });
    }

    const event = await meetingService.scheduleMeeting(
      user,
      title,
      location,
      description,
      participants,
      startTime,
      endTime
    );
    res.status(StatusCodes.CREATED).json({
      success: true,
      message: SuccessResponseMessages.CREATED("Meeting"),
      data: event,
    });
  } catch (err) {
    console.error("Error scheduling meeting:", err);
    res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
      success: false,
      message: ErrorResponseMessages.INTERNAL_ERROR,
      data: { error: (err as Error).message },
    });
  }
};

const getAllMeetings = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { year, month } = req.query;
    if (!year || !month) {
      return res
        .status(StatusCodes.BAD_REQUEST)
        .json({ success: false, message: ErrorResponseMessages.BAD_REQUEST("Year and month are required") });
    }
    const result = await meetingService.getAllMeetings(
      req.user,
      parseInt(year as string),
      parseInt(month as string)
    );
    res.status(StatusCodes.OK).json({
      success: true,
      message: SuccessResponseMessages.FETCHED("Meetings"),
      data: result,
    });
  } catch (error) {
    console.error("Error fetching meetings:", error);
    res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
      success: false,
      message: ErrorResponseMessages.INTERNAL_ERROR,
      data: { error: (error as Error).message },
    });
  }
};

// Update an existing meeting
const updateMeeting = async (req: AuthenticatedRequest, res: Response) => {
  try {
      const { user } = req;
      const { eventId } = req.params;
      const updatedData = req.body;

      if (!user) {
          return res.status(StatusCodes.UNAUTHORIZED).json({
              success: false,
              message: ErrorResponseMessages.UNAUTHORIZED,
              data: {},
          });
      }

      if (!eventId || !updatedData) {
          return res.status(StatusCodes.BAD_REQUEST).json({
              success: false,
              message: ErrorResponseMessages.BAD_REQUEST("Event ID and updated data are required"),
              data: {},
          });
      }

      const result = await meetingService.modifyMeeting(user, eventId, updatedData);
      res.status(StatusCodes.OK).json({
          success: true,
          message: SuccessResponseMessages.UPDATED("Meeting"),
          data: result,
      });
  } catch (err) {
      console.error("Error updating meeting:", err);
      res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
          success: false,
          message: ErrorResponseMessages.INTERNAL_ERROR,
          data: { error: (err as Error).message },
      });
  }
};

// Delete a meeting
const deleteMeeting = async (req: AuthenticatedRequest, res: Response) => {
  try {
      const { user } = req;
      const { eventId } = req.params;

      if (!user) {
          return res.status(StatusCodes.UNAUTHORIZED).json({
              success: false,
              message: ErrorResponseMessages.UNAUTHORIZED,
              data: {},
          });
      }

      if (!eventId) {
          return res.status(StatusCodes.BAD_REQUEST).json({
              success: false,
              message: ErrorResponseMessages.BAD_REQUEST("Event ID is required"),
              data: {},
          });
      }

      await meetingService.removeMeeting(user, eventId);
      res.status(StatusCodes.OK).json({
          success: true,
          message: SuccessResponseMessages.DELETED("Meeting"),
          data: {},
      });
  } catch (err) {
      console.error("Error deleting meeting:", err);
      res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
          success: false,
          message: ErrorResponseMessages.INTERNAL_ERROR,
          data: { error: (err as Error).message },
      });
  }
};

const verifyMeeting = async (req: Request, res: Response) => {
  try {
    const { meetingCode, token } = req.body;

    if (!meetingCode || !token) {
        return res.status(StatusCodes.BAD_REQUEST).json({
            success: false,
            message: ErrorResponseMessages.BAD_REQUEST("Meeting code and token are required"),
            data: {},
        });
    }

    const result = await meetingService.verifyMeeting(meetingCode, token);
    return res.status(StatusCodes.OK).json({
        success: true,
        message: SuccessResponseMessages.VERIFIED("Meeting"),
        data: result,
    });
} catch (error: any) {
    console.error("Error verifying meeting:", error);
    return res.status(error.status || StatusCodes.INTERNAL_SERVER_ERROR).json({
        success: false,
        message: error.message || ErrorResponseMessages.INTERNAL_ERROR,
        data: {},
    });
}
  
};

export {
  scheduleMeeting,
  getAllMeetings,
  updateMeeting,
  deleteMeeting,
  verifyMeeting,
};
