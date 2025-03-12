import express from "express";
import * as roleController from "../controllers/roleController";
import { authMiddleware, restrictTo } from "../middleware/authMiddleware";
import { AuthenticatedRequest } from "../controllers/roleController";

const router = express.Router();

router.post("/addRole", authMiddleware, restrictTo("addRole"), (req, res) => roleController.addRole(req as AuthenticatedRequest, res));
router.put("/editRole/:id", authMiddleware, restrictTo('editRole'), (req, res) => roleController.editRole(req as AuthenticatedRequest, res));
router.delete("/deleteRole/:id", authMiddleware, restrictTo('deleteRole'), (req, res) => roleController.deleteRole(req as AuthenticatedRequest, res));
router.get("/allRoles", authMiddleware, restrictTo('viewRoles'), (req, res) => roleController.getAllRoles(req as AuthenticatedRequest, res));

export default router;
