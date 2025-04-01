import { Collections } from "../constants/collections.constants";
import logger from "../utils/logger";
import { StatusCodes } from "../constants/status-codes.constants";

const functionName = {
  addRole: "addRole",
  editRole: "editRole",
  deleteRole: "deleteRole",
  getAllRoles: "getAllRoles",
};

async function addRole(name: string, permissions: string[]) {
  try {
    const role = new Collections.ROLE({ name, permissions });
    await role.save();

    logger.info({
      functionName: functionName.addRole,
      statusCode: StatusCodes.CREATED,
      message: "Role added successfully",
      data: { name, permissions },
    });

    return role;
  } catch (err) {
    logger.error({
      functionName: functionName.addRole,
      statusCode: StatusCodes.INTERNAL_SERVER_ERROR,
      message: "Error adding role",
      data: { error: err instanceof Error ? err.message : "Unknown error" },
    });
    throw new Error("Failed to add role");
  }
}

async function editRole(id: string, name: string, permissions: string[]) {
    try {
        const roleDoc = await Collections.ROLE.findById(id);
        if (!roleDoc) {
            throw new Error("Invalid role");
        }

        roleDoc.name = name;
        roleDoc.permissions = permissions;
        await roleDoc.save();

        logger.info({
            functionName: functionName.editRole,
            statusCode: StatusCodes.OK,
            message: "Role edited successfully",
            data: { id, name, permissions },
        });

        return roleDoc;
    } catch (error) {
        logger.error({
            functionName: functionName.editRole,
            statusCode: StatusCodes.INTERNAL_SERVER_ERROR,
            message: "Error editing role",
            data: { error: error instanceof Error ? error.message : "Unknown error" },
        });
        throw new Error("Failed to edit role");
    }
}

async function deleteRole(id: string) {
    try {
        const role = await Collections.ROLE.findByIdAndDelete(id);
        if (!role) {
            throw new Error("Role not found");
        }

        const nauRole = await Collections.ROLE.findOne({ name: "NAU" });
        if (!nauRole) {
            throw new Error("NAU role not found");
        }

        await Collections.USER.updateMany({ role: id }, { role: nauRole._id });

        logger.info({
            functionName: functionName.deleteRole,
            statusCode: StatusCodes.OK,
            message: "Role deleted successfully",
            data: { deletedRoleId: id },
        });

        return role;
    } catch (error) {
        logger.error({
            functionName: functionName.deleteRole,
            statusCode: StatusCodes.INTERNAL_SERVER_ERROR,
            message: "Error deleting role",
            data: { error: error instanceof Error ? error.message : "Unknown error" },
        });
        throw new Error("Failed to delete role");
    }
}

async function getAllRoles() {
    try {
        const roles = await Collections.ROLE.find();
        logger.info({
            functionName: functionName.getAllRoles,
            statusCode: StatusCodes.OK,
            message: "Fetched all roles successfully",
            data: { totalRoles: roles.length },
        });

        return roles;
    } catch (error) {
        logger.error({
            functionName: functionName.getAllRoles,
            statusCode: StatusCodes.INTERNAL_SERVER_ERROR,
            message: "Error fetching roles",
            data: { error: error instanceof Error ? error.message : "Unknown error" },
        });
        throw new Error("Failed to fetch roles");
    }
}

export { addRole, editRole, deleteRole, getAllRoles };
