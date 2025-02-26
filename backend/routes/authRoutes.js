const express = require("express");
const router = express.Router();
const auth=require('../middleware/auth');
const authController = require("../controllers/authController");

router.post("/signup", auth.authenticateUser, authController.signup);
router.post("/login", auth.authenticateUser, authController.login);
router.post("/google", auth.authenticateUser, authController.signInWithGoogle);

module.exports = router;

