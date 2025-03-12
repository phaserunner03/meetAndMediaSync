import express from "express";
import * as userController from "../controllers/userController";
import { authMiddleware, restrictTo } from "../middleware/authMiddleware";
import { AuthenticatedRequest } from "../controllers/userController";

const router = express.Router();

router.post("/notify", (req, res) => userController.notifyAdmin(req, res));
router.get("/user", authMiddleware, restrictTo('viewUser'), (req, res) => userController.getUser(req as AuthenticatedRequest, res));
router.post("/addUser", authMiddleware, restrictTo("addUser"),(req, res) =>  userController.addUser(req as AuthenticatedRequest, res));
router.delete("/deleteUser/:userId", authMiddleware, restrictTo("deleteUser"), (req, res) => userController.deleteUser(req as AuthenticatedRequest, res));
router.get("/allUsers", authMiddleware, restrictTo('viewAllUsers'), (req, res) => userController.getAllUsers(req as AuthenticatedRequest, res));
router.put("/editUserRole", authMiddleware, restrictTo('editUserRole'), (req, res) => userController.editUserRole(req as AuthenticatedRequest, res));

export default router;
