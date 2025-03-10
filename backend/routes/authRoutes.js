const express = require("express");
const router = express.Router();
const authController = require("../controllers/authController");
const { authMiddleware, restrictTo } = require("../middleware/authMiddleware");

router.get("/google", authController.redirectToGoogle);
router.get("/google/callback", authController.handleGoogleCallback);
router.get("/user", authMiddleware, restrictTo('viewUser'), authController.getUser);
router.post("/logout", authMiddleware, authController.logoutUser);
router.post("/refresh", authController.refreshAccessToken);
router.post("/addUser", authMiddleware, restrictTo("addUser"), authController.addUser);
router.post("/addRole", authMiddleware, restrictTo("addRole"), authController.addRole);
router.put("/editUserRole", authMiddleware, restrictTo("editUserRole"), authController.editUserRole);
router.delete("/deleteUser", authMiddleware, restrictTo("deleteUser"), authController.deleteUser);

module.exports = router;
