import express from "express";
import * as roleController from "../controllers/roleController";
import { authMiddleware, restrictTo } from "../middleware/authMiddleware";
import { AuthenticatedRequest } from "../controllers/roleController";
import { Permissions } from "../constants/permissions.constants";
import { validateRequest } from "../middleware/requestValidationMiddleware";
import * as roleSchema from "../schemas/roles.schemas";

const router = express.Router();

router.post("/addRole", authMiddleware, restrictTo(Permissions.ADD_ROLE),validateRequest(roleSchema.addRoleRequest),(req, res) => roleController.addRole(req as AuthenticatedRequest, res));
router.put("/editRole/:id", authMiddleware, restrictTo(Permissions.EDIT_ROLE),validateRequest(roleSchema.editRoleRequest), (req, res) => roleController.editRole(req as AuthenticatedRequest, res));
router.delete("/deleteRole/:id", authMiddleware, restrictTo(Permissions.DELETE_ROLE), (req, res) => roleController.deleteRole(req as AuthenticatedRequest, res));
router.get("/allRoles", authMiddleware, restrictTo(Permissions.VIEW_ROLES), (req, res) => roleController.getAllRoles(req as AuthenticatedRequest, res));

export default router;
