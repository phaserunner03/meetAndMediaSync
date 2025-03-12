import Role from "../models/Role";
import User from "../models/User";

async function addRole(name: string, permissions: string[]) {
    try {
        const role = new Role({ name, permissions });
        await role.save();
        return role;
    } catch (err) {
        console.error("Error adding role:", err);
        throw new Error("Failed to add role");
    }
}

async function editRole(id: string, name: string, permissions: string[]) {
    try {
        const roleDoc = await Role.findById(id);
        if (!roleDoc) {
            throw new Error("Invalid role");
        }
        roleDoc.name = name;
        roleDoc.permissions = permissions;
        await roleDoc.save();
        return roleDoc;
    } catch (err) {
        console.error("Error editing role:", err);
        throw new Error("Failed to edit role");
    }
}

async function deleteRole(id: string) {
    try {
        const role = await Role.findByIdAndDelete(id);
        if (!role) {
            throw new Error("Role not found");
        }
        const nauRole = await Role.findOne({ name: "NAU" });
        if (!nauRole) {
            throw new Error("NAU role not found");
        }

        await User.updateMany({ role: id }, { role: nauRole._id });
        return role;
    } catch (err) {
        console.error("Error deleting Role:", err);
        throw new Error("Failed to delete Role");
    }
}

async function getAllRoles() {
    try {
        const roles = await Role.find();
        return roles;
    } catch (err) {
        console.error("Error fetching roles:", err);
        throw new Error("Failed to fetch roles");
    }
}

export { addRole, editRole, deleteRole, getAllRoles };
