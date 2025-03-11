import express from "express";
import * as authController from "../controllers/authController";
import { authMiddleware, restrictTo } from "../middleware/authMiddleware";
import { AuthenticatedRequest } from "../controllers/authController";

const router = express.Router();
router.post("/notify", (req, res) => authController.notifyAdmin(req, res));
router.get("/google", authController.redirectToGoogle);
router.get("/google/callback", authController.handleGoogleCallback);
router.get("/user", authMiddleware, restrictTo('viewUser'), (req, res) => authController.getUser(req as AuthenticatedRequest, res));
router.post("/logout", authMiddleware, authController.logoutUser);
router.post("/refresh", authController.refreshAccessToken);
router.post("/addUser", authMiddleware, restrictTo("addUser"),(req, res) =>  authController.addUser(req as AuthenticatedRequest, res));
router.post("/addRole", authMiddleware, restrictTo("addRole"), (req, res) => authController.addRole(req as AuthenticatedRequest, res));
router.put("/editUserRole", authMiddleware, restrictTo("editUserRole"), (req, res) => authController.editUserRole(req as AuthenticatedRequest, res));
router.delete("/deleteUser/:userId", authMiddleware, restrictTo("deleteUser"), (req, res) => authController.deleteUser(req as AuthenticatedRequest, res));
router.get("/allUsers", authMiddleware, restrictTo('viewAllUsers'), (req, res) => authController.getAllUsers(req as AuthenticatedRequest, res));
router.get("/allRoles", authMiddleware, restrictTo('addRole'), (req, res) => authController.getAllRoles(req as AuthenticatedRequest, res));
router.put("/editRole/:id", authMiddleware, restrictTo('addRole'), (req, res) => authController.editRole(req as AuthenticatedRequest, res));
router.delete("/deleteRole/:id", authMiddleware, restrictTo('addRole'), (req, res) => authController.deleteRole(req as AuthenticatedRequest, res));

export default router;
