
import express from "express";
import mongoose from "mongoose";
import dotenv from "dotenv";
import authRoutes from "./routes/authRoutes.js";
import meetRoutes from "./routes/meetRoutes.js";
import cors from "cors";
import databaseConnect from "./config/db.js"; 
// const cookieParser = require("cookie-parser");
dotenv.config();


const PORT = process.env.PORT || 5000;
const app = express();

app.use(cors());
app.use(express.json());
// app.use(cookieParser());

databaseConnect();

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

//Feature 1: User Registration and registration
app.use("/api/auth", authRoutes);
app.use("/api/schedule",meetRoutes);


app.get("/", (req, res) => {
    return res.json({
    success: true,
    message: "Your server is up and running....",
    });
  });





