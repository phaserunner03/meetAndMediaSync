import { Collections } from "../constants/collections.constants";
import logger from "../utils/logger";
import { StatusCodes } from "../constants/status-codes.constants";
import {
  SuccessResponseMessages,
  ErrorResponseMessages,
} from "../constants/service-messages.constants";
import permissions from "./permission.json";
import { ObjectId } from "mongoose";
import { Seed } from "../constants/seeds.constants";

const functionName = {
  seed: "seedConfig",
  upsertRole: "upsertRole",
  createUser: "createSeedUser",
};

const SEED_EMAIL = Seed.SEED_EMAIL;
const SEED_ROLE_NAME = Seed.SEED_ROLE_NAME;
const NAU_ROLE_NAME = Seed.NAU_ROLE_NAME;

const upsertRole = async (name: string, perms: string[]) => {
  try {
    const existingRole = await Collections.ROLE.findOne({ name });

    if (existingRole) {
      existingRole.permissions = perms;
      await existingRole.save();

      logger.info({
        functionName: functionName.upsertRole,
        statusCode: StatusCodes.OK,
        message: SuccessResponseMessages.UPDATED(`role "${name}"`),
        data: { roleId: existingRole._id },
      });

      return existingRole;
    }

    const newRole = await Collections.ROLE.create({ name, permissions: perms });

    logger.info({
      functionName: functionName.upsertRole,
      statusCode: StatusCodes.CREATED,
      message: SuccessResponseMessages.CREATED(`role "${name}"`),
      data: { roleId: newRole._id },
    });

    return newRole;
  } catch (error) {
    logger.error({
      functionName: functionName.upsertRole,
      statusCode: StatusCodes.INTERNAL_SERVER_ERROR,
      message: `Error creating/updating role "${name}"`,
      data: {
        error: (error as Error).message,
        stack: (error as Error).stack,
      },
    });
    throw error;
  }
};
const createSeedUser = async (email: string, roleName: string) => {
    try{
        const existingUser = await Collections.USER.findOne({email});
        const role = await Collections.ROLE.findOne({name:roleName});
        if(!role){
            logger.error({
                functionName:functionName.createUser,
                statusCode:StatusCodes.INTERNAL_SERVER_ERROR,
                message:ErrorResponseMessages.NOT_FOUND("Role"),
                data:{}
            })
            throw new Error(ErrorResponseMessages.NOT_FOUND("Role"));
        }
        if (existingUser) {
            existingUser.role = role?._id as ObjectId;
            await existingUser.save();
      
            logger.info({
              functionName: functionName.createUser,
              statusCode: StatusCodes.OK,
              message: SuccessResponseMessages.UPDATED("user role"),
              data: { userId: existingUser._id },
            });
      
            return;
          }
          const newUser = await Collections.USER.create({
            email,
            role: role._id,
          });
      
          logger.info({
            functionName: functionName.createUser,
            statusCode: StatusCodes.CREATED,
            message: SuccessResponseMessages.CREATED("seed user"),
            data: { userId: newUser._id },
          });

    }
    catch(error){
        logger.error({
            functionName: functionName.createUser,
            statusCode: StatusCodes.INTERNAL_SERVER_ERROR,
            message: `Error creating seed user for email "${email}"`,
            data: {
              error: (error as Error).message,
              stack: (error as Error).stack,
            },
          });

    }
}
export const seedConfig = async () => {
  try {
    await upsertRole(SEED_ROLE_NAME, permissions);
    await upsertRole(NAU_ROLE_NAME, ["viewUser"]);
    await createSeedUser(SEED_EMAIL, SEED_ROLE_NAME);
  } catch (error) {
    logger.error({
      functionName: functionName.seed,
      statusCode: StatusCodes.INTERNAL_SERVER_ERROR,
      message: "Error during seeding process",
      data: {
        error: (error as Error).message,
        stack: (error as Error).stack,
      },
    });
  }
};
