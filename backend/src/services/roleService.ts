import { Collections } from "../constants/collections.constants";

async function addRole(name: string, permissions: string[]) {
    try {
        const role = new Collections.ROLE({ name, permissions });
        await role.save();
        return role;
    } catch (err) {
        console.error("Error adding role:", err);
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
        return roleDoc;
    } catch (err) {
        console.error("Error editing role:", err);
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
        return role;
    } catch (err) {
        console.error("Error deleting Role:", err);
        throw new Error("Failed to delete Role");
    }
}

async function getAllRoles() {
    try {
        const roles = await Collections.ROLE.find();
        return roles;
    } catch (err) {
        console.error("Error fetching roles:", err);
        throw new Error("Failed to fetch roles");
    }
}

export { addRole, editRole, deleteRole, getAllRoles };
