import cron from "node-cron";
import { transferScreenshotsToGCP } from "../services/transferService";
import { Collections } from "../constants/collections.constants";
import { CronJobFrequencies } from "../constants/cron-jobs.constants";
import logger from "../utils/logger";
import { RoleDocument } from "../constants/types.constants";
import { StatusCodes } from "../constants/status-codes.constants";
import { Permissions } from "../constants/permissions.constants";

const functionName = { transferCronJob: "transferCronJob" };

cron.schedule(CronJobFrequencies.EVERY_TWO_HOURS, async () => {
  logger.info({
    functionName: functionName.transferCronJob,
    statusCode: StatusCodes.OK,
    message: "Scheduled transfer task started.",
    data: {},
  });
  try {
    const users = await Collections.USER.find({
      refreshToken: { $exists: true },
    }).populate<{ role: RoleDocument }>("role", "name permissions"); // Fetch users with refreshToken

    if (users.length === 0) {
      logger.warn({
        functionName: functionName.transferCronJob,
        statusCode: StatusCodes.NO_CONTENT,
        message: "No users found with refresh token.",
        data: {},
      });
    }

    for (const user of users) {
      if (user.role.permissions.includes(Permissions.GROUP_MEETING)) {
        logger.info({
          functionName: functionName.transferCronJob,
          statusCode: StatusCodes.OK,
          message: `Transferring screenshots for user: ${user.email}`,
          data: {},
        });
        await transferScreenshotsToGCP(user.refreshToken, user.email);
      } else {
        logger.warn({
          functionName: functionName.transferCronJob,
          statusCode: StatusCodes.FORBIDDEN,
          message: `User ${user.email} does not have permission to transfer screenshots.`,
          data: {},
        });
      }
    }
    logger.info({
      functionName: "cronJob",
      statusCode: StatusCodes.OK,
      message: "Scheduled transfer task completed",
      data: {},
    });
  } catch (error) {
    logger.error({
      functionName: functionName.transferCronJob,
      statusCode: StatusCodes.INTERNAL_SERVER_ERROR,
      message: "Error transferring screenshots",
      data: {
        name: (error as Error).name,
        stack: (error as Error).stack
    }
    });
  }
});
