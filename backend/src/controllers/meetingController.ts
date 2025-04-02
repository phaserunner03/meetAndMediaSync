import { Request, Response } from "express";
import * as meetingService from "../services/meetingService";
import { StatusCodes } from "../constants/status-codes.constants";
import {
  ErrorResponseMessages,
  SuccessResponseMessages,
} from "../constants/service-messages.constants";
import logger from "../utils/logger";

interface AuthenticatedRequest extends Request {
  user: any;
}

const functionName = {
  scheduleMeeting: "scheduleMeeting",
  getAllMeetings: "getAllMeetings",
  updateMeeting: "updateMeeting",
  deleteMeeting: "deleteMeeting",
  verifyMeeting: "verifyMeeting",
};

const scheduleMeeting = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { user } = req;
    const { title, location, description, participants, startTime, endTime } =
      req.body;
    if (!user) {
      logger.warn({
        functionName: functionName.scheduleMeeting,
        statusCode: StatusCodes.UNAUTHORIZED,
        message: "Unauthorized request - No user",
        data: {},
      });
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
    logger.info({
      functionName: functionName.scheduleMeeting,
      statusCode: StatusCodes.CREATED,
      message: "Meeting scheduled successfully",
      data: { eventId: event },
    });
    res.status(StatusCodes.CREATED).json({
      success: true,
      message: SuccessResponseMessages.CREATED("Meeting"),
      data: event,
    });
  } catch (error) {
    logger.error({
      functionName: functionName.scheduleMeeting,
      statusCode: StatusCodes.INTERNAL_SERVER_ERROR,
      message: "Error scheduling meeting",
      data: { error: (error as Error).message },
    });
    res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
      success: false,
      message: ErrorResponseMessages.INTERNAL_ERROR,
      data: { error: (error as Error).message },
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

    logger.info({
      functionName :functionName.getAllMeetings,
      statusCode: StatusCodes.OK,
      message: "Meetings fetched successfully",
      data:{userId: req.user.googleId,
      totalMeetings: result.ourMeetings.length}
    });

    res.status(StatusCodes.OK).json({
      success: true,
      message: SuccessResponseMessages.FETCHED("Meetings"),
      data: result,
    });
  } catch (error) {
    
    logger.error({
      functionName,
      statusCode: StatusCodes.INTERNAL_SERVER_ERROR,
      message: "Error fetching meetings",
      data: { error: (error as Error).message
      },
    });

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
      logger.warn({
        functionName: functionName.updateMeeting,
        statusCode: StatusCodes.UNAUTHORIZED,
        message: "Unauthorized request - No user",
        data: {},
      });

      return res.status(StatusCodes.UNAUTHORIZED).json({
        success: false,
        message: ErrorResponseMessages.UNAUTHORIZED,
        data: {},
      });
    }

    if (!eventId || !updatedData) {
      logger.warn({
        functionName: functionName.updateMeeting,
        statusCode: StatusCodes.BAD_REQUEST,
        message: "Event ID and updated data are required",
        data: {},
      });
      return res.status(StatusCodes.BAD_REQUEST).json({
        success: false,
        message: ErrorResponseMessages.BAD_REQUEST(
          "Event ID and updated data are required"
        ),
        data: {},
      });
    }

    const result = await meetingService.modifyMeeting(
      user,
      eventId,
      updatedData
    );

    logger.info({
      functionName: functionName.updateMeeting,
      statusCode: StatusCodes.OK,
      message: "Meeting updated successfully",
      data: { eventId },
    });

    res.status(StatusCodes.OK).json({
      success: true,
      message: SuccessResponseMessages.UPDATED("Meeting"),
      data: result,
    });
  } catch (err) {
    logger.error({
      functionName: functionName.updateMeeting,
      statusCode: StatusCodes.INTERNAL_SERVER_ERROR,
      message: "Error updating meeting",
      data: { error: (err as Error).message },
    });
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
      logger.warn({
        functionName: functionName.deleteMeeting,
        statusCode: StatusCodes.UNAUTHORIZED,
        message: "Unauthorized request - No user",
        data: {
          userId: user?.googleId,
        },
      })
      return res.status(StatusCodes.UNAUTHORIZED).json({
        success: false,
        message: ErrorResponseMessages.UNAUTHORIZED,
        data: {},
      });
    }

    if (!eventId) {
      logger.warn({
        functionName: functionName.deleteMeeting,
        statusCode: StatusCodes.BAD_REQUEST,
        message: "Event ID is required",
        data: {},
      });
      return res.status(StatusCodes.BAD_REQUEST).json({
        success: false,
        message: ErrorResponseMessages.BAD_REQUEST("Event ID is required"),
        data: {},
      });
    }

    await meetingService.removeMeeting(user, eventId);
    logger.info({
      functionName: functionName.deleteMeeting,
      statusCode: StatusCodes.OK,
      message: "Meeting deleted successfully",
      data: { eventId },
    })
    res.status(StatusCodes.OK).json({
      success: true,
      message: SuccessResponseMessages.DELETED("Meeting"),
      data: {},
    });
  } catch (err) {
    logger.error({
      functionName: functionName.deleteMeeting,
      statusCode: StatusCodes.INTERNAL_SERVER_ERROR,
      message: "Error deleting meeting",
      data: { error: (err as Error).message },
    });
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
      logger.warn({
        functionName: functionName.verifyMeeting,
        statusCode: StatusCodes.BAD_REQUEST,
        message: "Meeting code and token are required",
        data: {},
      });
      return res.status(StatusCodes.BAD_REQUEST).json({
        success: false,
        message: ErrorResponseMessages.BAD_REQUEST(
          "Meeting code and token are required"
        ),
        data: {},
      });
    }

    const result = await meetingService.verifyMeeting(meetingCode, token);
    logger.info({
      functionName: functionName.verifyMeeting,
      statusCode: StatusCodes.OK,
      message: "Meeting verified successfully",
      data: result,
    });
    return res.status(StatusCodes.OK).json({
      success: true,
      message: SuccessResponseMessages.VERIFIED("Meeting"),
      data: result,
    });
  } catch (error: any) {
    logger.error({
      functionName: functionName.verifyMeeting,
      statusCode: StatusCodes.INTERNAL_SERVER_ERROR,
      message: "Error verifying meeting",
      data: { error: error.message },
    });
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
