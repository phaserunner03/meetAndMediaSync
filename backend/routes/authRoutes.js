const express = require("express");
const router = express.Router();
const auth=require('../middleware/auth');
const authController = require("../controllers/authController");

router.post("/signup",auth, authController.signup);
router.post("/login",auth, authController.login);
router.post("/google",auth, authController.signInWithGoogle);

module.exports = router;

