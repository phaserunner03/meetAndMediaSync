import express from "express";
import * as authController from "../controllers/authController";

const router = express.Router();

router.get("/google", authController.redirectToGoogle);
router.get("/google/callback", authController.handleGoogleCallback);
router.post("/logout", authController.logoutUser);
router.get("/check-refresh", authController.refreshJwtToken);

export default router;
