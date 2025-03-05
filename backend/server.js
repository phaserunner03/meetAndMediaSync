const express = require("express");
const databaseConnect = require("./config/database");
const cors = require("cors");
const dotenv = require("dotenv").config();
const authRoutes = require("./routes/authRoutes");
const cookieParser = require("cookie-parser");
const meetingRoutes = require("./routes/meetingRoutes");

const PORT = process.env.PORT || 5000;
const app = express();

app.use(cors({
  origin: process.env.FRONTEND_URL,
  credentials: true, // Allow cookies to be sent from frontend
}));
app.use(express.json());
app.use(cookieParser());

databaseConnect();

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

//Feature 1: User Registration and registration
app.use("/api/auth", authRoutes);
//Feature 2: Schedule an meeting and all details
app.use("/api/meetings", meetingRoutes);




app.get("/", (req, res) => {
    return res.json({
    success: true,
    message: "Your server is up and running....",
    });
  });