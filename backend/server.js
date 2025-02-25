const express = require("express");
const databaseConnect = require("./config/database");
const cors = require("cors");
const dotenv = require("dotenv").config();
const authRoutes = require("./routes/authRoutes");
// const cookieParser = require("cookie-parser");


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


app.get("/", (req, res) => {
    return res.json({
    success: true,
    message: "Your server is up and running....",
    });
  });