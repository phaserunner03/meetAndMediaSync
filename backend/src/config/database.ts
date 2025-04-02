import mongoose from "mongoose";
import { environment } from "../constants/environments.constants";
import logger from "../utils/logger";
import { SuccessResponseMessages } from "../constants/service-messages.constants";
import { StatusCodes } from "../constants/status-codes.constants";

const functionName = {databaseConnect:"databaseConnect"}

const databaseConnect = async () => {
  const databaseUrl = environment.DATABASE_URL;

  if (!databaseUrl) {
    logger.error({
      functionName: functionName.databaseConnect,
      statusCode: StatusCodes.INTERNAL_SERVER_ERROR,
      message: "DATABASE_URL is not defined in the environment variables",
      data: {},
    });
    return;
  }

  try {
    await mongoose.connect(databaseUrl);
    logger.info({
      functionName: functionName.databaseConnect,
      statusCode: StatusCodes.OK,
      message: "Connected to database",
      data: {},
    });
  } catch (error) {
    logger.error({
      functionName: functionName.databaseConnect,
      statusCode: StatusCodes.INTERNAL_SERVER_ERROR,
      message: "Error connecting to database",
      data: {
        name: (error as Error).name,
        stack: (error as Error).stack
    }
    });
  }
};

export default databaseConnect;
