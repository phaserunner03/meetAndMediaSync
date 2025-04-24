import { Response } from "express";
import { fetchMeetings } from "../services/reportService";
import { AuthenticatedRequest } from "../constants/types.constants";
import { ErrorResponseMessages } from "../constants/service-messages.constants";
import { StatusCodes } from "../constants/status-codes.constants";
import logger from "../utils/logger";


export const generateReport = async (req: AuthenticatedRequest, res: Response) => {
  const functionName = "generateReport";
  logger.info({ functionName, message: "Function started" });
  try {
    const reportData = await fetchMeetings(req.query, req.user);
    logger.info({ 
        functionName, 
        statusCode: StatusCodes.OK, 
        message: "Report data fetched successfully", 
        data: reportData });
    res.status(StatusCodes.OK).json(reportData);
  } catch (error) {
    logger.error({ 
        functionName, 
        statusCode: StatusCodes.INTERNAL_SERVER_ERROR, 
        message: "Error occurred", 
        error });
    res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ message: ErrorResponseMessages.INTERNAL_ERROR });
  } finally {
    logger.info({ 
        functionName, 
        message: "Function ended" });
  }
};