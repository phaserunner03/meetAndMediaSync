import express from "express";
import * as roleController from "../controllers/roleController";
import { authMiddleware, restrictTo } from "../middleware/authMiddleware";
import { AuthenticatedRequest } from "../controllers/roleController";
import { Permissions } from "../constants/permissions.constants";
import { validateRequest } from "../middleware/requestValidationMiddleware";
import * as roleSchema from "../schemas/roles.schemas";

const router = express.Router();

/**
 * @swagger
 * tags:
 *   name: Roles
 *   description: Role management APIs
 */

/**
 * @swagger
 * /roles/v1/addRole:
 *   post:
 *     summary: Add a new role
 *     tags: [Roles]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/AddRoleRequest'
 *     responses:
 *       201:
 *         description: Role added successfully
 */

/**
 * @swagger
 * /roles/v1/editRole/{id}:
 *   put:
 *     summary: Edit an existing role
 *     tags: [Roles]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID of the role to edit
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/EditRoleRequest'
 *     responses:
 *       200:
 *         description: Role edited successfully
 */

/**
 * @swagger
 * /roles/v1/deleteRole/{id}:
 *   delete:
 *     summary: Delete a role
 *     tags: [Roles]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID of the role to delete
 *     responses:
 *       200:
 *         description: Role deleted successfully
 */

/**
 * @swagger
 * /roles/v1/allRoles:
 *   get:
 *     summary: Get all roles
 *     tags: [Roles]
 *     responses:
 *       200:
 *         description: Roles fetched successfully
 */

router.post("/addRole", authMiddleware, restrictTo(Permissions.ADD_ROLE), validateRequest(roleSchema.addRoleRequest), (req, res) => roleController.addRole(req as AuthenticatedRequest, res));
router.put("/editRole/:id", authMiddleware, restrictTo(Permissions.EDIT_ROLE), validateRequest(roleSchema.editRoleRequest), (req, res) => roleController.editRole(req as AuthenticatedRequest, res));
router.delete("/deleteRole/:id", authMiddleware, restrictTo(Permissions.DELETE_ROLE), (req, res) => roleController.deleteRole(req as AuthenticatedRequest, res));
router.get("/allRoles", authMiddleware, restrictTo(Permissions.VIEW_ROLES), (req, res) => roleController.getAllRoles(req as AuthenticatedRequest, res));
router.get("/getBelowRoles", authMiddleware, restrictTo(Permissions.VIEW_ROLES), (req, res) => roleController.getBelowRoles(req as AuthenticatedRequest, res));

export default router;
