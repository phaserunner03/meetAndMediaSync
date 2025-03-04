const express = require("express");
const router = express.Router();
const authController = require("../controllers/authController");
const authMiddleware = require("../middleware/authMiddleware");

router.get("/google", authController.redirectToGoogle);
router.get("/google/callback", authController.handleGoogleCallback);
router.get("/user", authMiddleware.authMiddleware, authController.getUser);
router.post("/logout", authMiddleware.authMiddleware, authController.logoutUser);

module.exports = router;    
