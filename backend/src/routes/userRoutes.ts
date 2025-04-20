import express from "express";
import * as userController from "../controllers/userController";
import { authMiddleware, restrictTo } from "../middleware/authMiddleware";
import { AuthenticatedRequest } from "../controllers/userController";
import { Permissions } from "../constants/permissions.constants";
import { validateRequest } from "../middleware/requestValidationMiddleware";
import * as userSchema from "../schemas/user.schema";

const router = express.Router();

/**
 * @swagger
 * tags:
 *   name: Users
 *   description: User management APIs
 */

/**
 * @swagger
 * /users/v1/notify:
 *   post:
 *     summary: Notify admin about a new user
 *     tags: [Users]
 *     responses:
 *       200:
 *         description: Notification sent successfully
 */
router.post("/notify", (req, res) => userController.notifyAdmin(req, res));

/**
 * @swagger
 * /users/v1/user:
 *   get:
 *     summary: Get authenticated user details
 *     tags: [Users]
 *     responses:
 *       200:
 *         description: User details fetched successfully
 */
router.get("/user", authMiddleware, restrictTo(Permissions.VIEW_USER), (req, res) => userController.getUser(req as AuthenticatedRequest, res));

/**
 * @swagger
 * /users/v1/addUser:
 *   post:
 *     summary: Add a new user
 *     tags: [Users]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/CreateUserRequest'
 *     responses:
 *       201:
 *         description: User created successfully
 */
router.post("/addUser", authMiddleware, restrictTo(Permissions.ADD_USER),validateRequest(userSchema.createUserRequest), (req, res) =>  userController.addUser(req as AuthenticatedRequest, res));

/**
 * @swagger
 * /users/v1/deleteUser/{userId}:
 *   delete:
 *     summary: Delete a user
 *     tags: [Users]
 *     parameters:
 *       - in: path
 *         name: userId
 *         required: true
 *         schema:
 *           type: string
 *         description: ID of the user to delete
 *     responses:
 *       200:
 *         description: User deleted successfully
 */
router.delete("/deleteUser/:userId", authMiddleware, restrictTo(Permissions.DELETE_USER), (req, res) => userController.deleteUser(req as AuthenticatedRequest, res));

/**
 * @swagger
 * /users/v1/allUsers:
 *   get:
 *     summary: Get all users
 *     tags: [Users]
 *     responses:
 *       200:
 *         description: Users fetched successfully
 */
router.get("/allUsers", authMiddleware, restrictTo(Permissions.VIEW_ALL_USERS), (req, res) => userController.getAllUsers(req as AuthenticatedRequest, res));

/**
 * @swagger
 * /users/v1/editUserRole:
 *   put:
 *     summary: Edit user role
 *     tags: [Users]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/UpdateUserRequest'
 *     responses:
 *       200:
 *         description: User role updated successfully
 */
router.put("/editUserRole", authMiddleware, restrictTo(Permissions.EDIT_USER_ROLE),validateRequest(userSchema.updateUserRequest) ,(req, res) => userController.editUserRole(req as AuthenticatedRequest, res));

export default router;
