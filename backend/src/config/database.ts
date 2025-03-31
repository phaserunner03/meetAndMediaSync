import mongoose from "mongoose";
import { environment } from "../constants/environments.constants";
import logger from "../utils/logger";
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
      data: { error: error instanceof Error ? error.message : "Unknown error" },
    });
  }
};

export default databaseConnect;
