import { Collections } from "../constants/collections.constants";
import nodemailer from "nodemailer";
import mongoose from "mongoose";
import {
  newUserAccessRequestTemplate,
  welcomeUserTemplate,
} from "../utils/emailTemplate";
import {
  secretVariables,
  environment,
} from "../constants/environments.constants";
import { RoleDocument } from "../constants/types.constants";
import logger from "../utils/logger";
import { StatusCodes } from "../constants/status-codes.constants";
import permissionsConfig from "../config/permission.json";

const functionName = {
  notifyAdminToAddUser: "notifyAdminToAddUser",
  sendWelcomeEmail: "sendWelcomeEmail",
  addUser: "addUser",
  getAuthenticatedUser: "getAuthenticatedUser",
  deleteUser: "deleteUser",
  editUserRole: "editUserRole",
};

const SMTP_CONFIG = {
  host: secretVariables.SMTP.HOST,
  port: parseInt(secretVariables.SMTP.PORT),
  auth: {
    user: secretVariables.SMTP.USER,
    pass: secretVariables.SMTP.PASS,
  },
};

const FRONTEND_URL = environment.FRONTEND_URL;

async function notifyAdminToAddUser(userInfo: any) {
  try {
    const transporter = nodemailer.createTransport(SMTP_CONFIG);

    const mailOptions = {
      from: `"No Reply" <${SMTP_CONFIG.auth.user}>`,
      to: secretVariables.ADMIN_EMAIL,
      ...newUserAccessRequestTemplate(userInfo),
    };

    await transporter.sendMail(mailOptions);
    logger.info({
      functionName: functionName.notifyAdminToAddUser,
      statusCode: StatusCodes.OK,
      message: `Notification sent to admin for user: ${userInfo.email}`,
      data: { userInfo },
    });
    
  } catch (error) {
    logger.error({
      functionName: functionName.notifyAdminToAddUser,
      statusCode: StatusCodes.INTERNAL_SERVER_ERROR,
      message: "Error notifying admin",
      data: {
        name: (error as Error).name,
        stack: (error as Error).stack
    }
    });
    throw new Error("Failed to notify admin");
  }
}

async function sendWelcomeEmail(user: { email: string }) {
  try {
    const transporter = nodemailer.createTransport(SMTP_CONFIG);

    const loginUrl = `${FRONTEND_URL}/login`;
    const emailTemplate = welcomeUserTemplate({ email: user.email }, loginUrl);

    const mailOptions = {
      from: `"CloudCapture" <${secretVariables.SMTP.USER}>`,
      to: user.email,
      subject: emailTemplate.subject,
      text: emailTemplate.text,
      html: emailTemplate.html,
    };

    await transporter.sendMail(mailOptions);
    logger.info({
      functionName: functionName.sendWelcomeEmail,
      statusCode: StatusCodes.OK,
      message: `Welcome email sent to ${user.email}`,
      data: { userEmail: user.email },
    });
  } catch (error) {
    logger.error({
      functionName: functionName.sendWelcomeEmail,
      statusCode: StatusCodes.INTERNAL_SERVER_ERROR,
      message: "Error sending welcome email",
      data: {
        name: (error as Error).name,
        stack: (error as Error).stack
    }
    });
    throw new Error("Failed to send welcome email");
  }
}

async function canAssignRole(userRoleId: string, targetRoleId: string): Promise<boolean> {
  const userRole = await Collections.ROLE.findById(userRoleId);
  const targetRole = await Collections.ROLE.findById(targetRoleId);

  if (!userRole || !targetRole) {
    throw new Error("Invalid role(s) provided.");
  }

  const userPermissions = userRole.permissions;
  const targetPermissions = targetRole.permissions;

  return canAssignPermissions(userPermissions, targetPermissions);
}


async function addUser(email: string, role: string, userRoleId: string) {
  if (!(await canAssignRole(userRoleId, role))) {
    throw new Error("You cannot assign a role higher than your own.");
  }
  try {
    const roleDoc = await Collections.ROLE.findById(role);
    if (!roleDoc) {
      throw new Error("Invalid role");
    }
    const user = new Collections.USER({ email, role: roleDoc._id });
    await user.save();
    logger.info({
      functionName: functionName.addUser,
      statusCode: StatusCodes.CREATED,
      message: "New user created",
      data: { userId: user._id, email, role: roleDoc.name },
    });

    await sendWelcomeEmail(user);

    return user;
  } catch (error) {
    logger.error({
      functionName: functionName.addUser,
      statusCode: StatusCodes.INTERNAL_SERVER_ERROR,
      message: "Error adding user",
      data: {
        name: (error as Error).name,
        stack: (error as Error).stack
    }
    });
    throw new Error("Failed to add user");
  }
}

async function getAuthenticatedUser(userId: string) {
  try {
    const user = await Collections.USER.findOne({ googleId: userId })
      .select("-refreshToken")
      .populate<{ role: typeof Collections.ROLE }>("role", "name permissions");

    if (!user) {
      throw new Error("User not found");
    }
    const userData = {
      displayName: user.displayName,
      email: user.email,
      photoURL: user.photoURL,
      role: {
        name: user.role.name,
        permissions: (user.role as unknown as RoleDocument).permissions,
      },
    };

    logger.info({
      functionName: functionName.getAuthenticatedUser,
      statusCode: StatusCodes.OK,
      message: "Fetched authenticated user",
      data: { userId },
    });

    return userData;
  } catch (error) {
    logger.error({
      functionName: functionName.getAuthenticatedUser,
      statusCode: StatusCodes.INTERNAL_SERVER_ERROR,
      message: "Error fetching user data",
      data: {
        name: (error as Error).name,
        stack: (error as Error).stack
    }
    });
    throw new Error("Failed to fetch user data");
  }
}

async function deleteUser(userId: string) {
  try {
    const user = await Collections.USER.findByIdAndDelete(userId);
    if (!user) {
      throw new Error("User not found");
    }
    logger.info({
      functionName: functionName.deleteUser,
      statusCode: StatusCodes.OK,
      message: `User deleted successfully`,
      data: { userId },
    });
    return user;
  } catch (error) {
    logger.error({
      functionName: functionName.deleteUser,
      statusCode: StatusCodes.INTERNAL_SERVER_ERROR,
      message: "Error deleting user",
      data: {
        name: (error as Error).name,
        stack: (error as Error).stack
    }
    });
    throw new Error("Failed to delete user");
  }
}

async function editUserRole(
  userId: string,
  newRole: mongoose.Schema.Types.ObjectId
) {
  try {
    const roleDoc = await Collections.ROLE.findById(newRole);
    if (!roleDoc) {
      throw new Error("Invalid role");
    }

    const user = await Collections.USER.findById(userId);
    if (!user) {
      throw new Error("User not found");
    }

    user.role = newRole;
    await user.save();

    logger.info({
      functionName: functionName.editUserRole,
      statusCode: StatusCodes.OK,
      message: "User role updated successfully",
      data: { userId, newRole: roleDoc.name },
    });

    return user;

  } catch (error) {

    logger.error({
        functionName: functionName.editUserRole,
        statusCode: StatusCodes.INTERNAL_SERVER_ERROR,
        message: "Error editing user role",
        data: {
        name: (error as Error).name,
        stack: (error as Error).stack
    }
        
      });
    throw new Error("Failed to edit user role");
  }
}

function getPermissionLevel(permission: string): number {
  for (const level of permissionsConfig.levels) {
    if (level.permissions.includes(permission)) {
      return level.level;
    }
  }
  return -1; // Invalid permission
}

function canAssignPermissions(userPermissions: string[], targetPermissions: string[]): boolean {
  const userMaxLevel = Math.max(...userPermissions.map(getPermissionLevel));
  return targetPermissions.every((perm) => getPermissionLevel(perm) <= userMaxLevel);
}

export {
  notifyAdminToAddUser,
  sendWelcomeEmail,
  addUser,
  getAuthenticatedUser,
  deleteUser,
  editUserRole,
};


