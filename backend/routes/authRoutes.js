// const express = require("express");
// const router = express.Router();

// const authController = require("../controllers/authController");

// router.post("/signup", authController.signup);
// router.post("/login", authController.login);
// router.post("/google", authController.signInWithGoogle);

// module.exports = router;



import express from "express";
import { googleAuth, googleCallback, refreshToken } from "../controllers/authController.js";

const router = express.Router();

router.get("/google", googleAuth);
router.get("/google/callback", googleCallback);
router.post("/refresh-token", refreshToken);

export default router;
