import mongoose from "mongoose";
import { environment } from "../constants/environments.constants";
import logger from "../utils/logger";

const functionName = {databaseConnect:"databaseConnect"}
const databaseConnect = async () => {
  const databaseUrl = environment.DATABASE_URL;
  if (!databaseUrl) {
    console.error("DATABASE_URL is not defined in the environment variables");
    return;
  }

  mongoose
    .connect(databaseUrl)
    .then(() => {
      logger.info({functionName:functionName.databaseConnect,statusCode:"200", message: "Connected to database",data:{} });
    })
    .catch((error) => {
      console.log("Error connecting to database");
      console.error(error);
    });
};

export default databaseConnect;
