import express from "express";
import * as userController from "../controllers/userController";
import { authMiddleware, restrictTo } from "../middleware/authMiddleware";
import { AuthenticatedRequest } from "../controllers/userController";
import { Permissions } from "../constants/permissions.constants";
import { validateRequest } from "../middleware/requestValidationMiddleware";
import * as userSchema from "../schemas/user.schema";

const router = express.Router();

router.post("/notify", (req, res) => userController.notifyAdmin(req, res));
router.get("/user", authMiddleware, restrictTo(Permissions.VIEW_USER), (req, res) => userController.getUser(req as AuthenticatedRequest, res));
router.post("/addUser", authMiddleware, restrictTo(Permissions.ADD_USER),validateRequest(userSchema.createUserRequest), (req, res) =>  userController.addUser(req as AuthenticatedRequest, res));
router.delete("/deleteUser/:userId", authMiddleware, restrictTo(Permissions.DELETE_USER), (req, res) => userController.deleteUser(req as AuthenticatedRequest, res));
router.get("/allUsers", authMiddleware, restrictTo(Permissions.VIEW_ALL_USERS), (req, res) => userController.getAllUsers(req as AuthenticatedRequest, res));
router.put("/editUserRole", authMiddleware, restrictTo(Permissions.EDIT_USER_ROLE),validateRequest(userSchema.updateUserRequest) ,(req, res) => userController.editUserRole(req as AuthenticatedRequest, res));

export default router;
