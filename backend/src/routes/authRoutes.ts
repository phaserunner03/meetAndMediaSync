import express from "express";
import * as authController from "../controllers/authController";

const router = express.Router();

/**
 * @swagger
 * tags:
 *   name: Auth
 *   description: Authentication APIs
 */

/**
 * @swagger
 * /auth/v1/google:
 *   get:
 *     summary: Redirect to Google OAuth
 *     tags: [Auth]
 *     responses:
 *       302:
 *         description: Redirects to Google OAuth
 */

/**
 * @swagger
 * /auth/v1/google/callback:
 *   get:
 *     summary: Handle Google OAuth callback
 *     tags: [Auth]
 *     responses:
 *       200:
 *         description: Authentication successful
 */

/**
 * @swagger
 * /auth/v1/logout:
 *   post:
 *     summary: Logout the user
 *     tags: [Auth]
 *     responses:
 *       200:
 *         description: User logged out successfully
 */

/**
 * @swagger
 * /auth/v1/check-refresh:
 *   get:
 *     summary: Check and refresh JWT token
 *     tags: [Auth]
 *     responses:
 *       200:
 *         description: Token refreshed successfully
 */

router.get("/google", authController.redirectToGoogle);
router.get("/google/callback", authController.handleGoogleCallback);
router.post("/logout", authController.logoutUser);
router.get("/check-refresh", authController.refreshJwtToken);

export default router;
