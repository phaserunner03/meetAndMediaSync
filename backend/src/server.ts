import express, { Request, Response, NextFunction } from "express";
import databaseConnect from "./config/database";
import cors from "cors";
import dotenv from "dotenv";
import authRoutes from "./routes/authRoutes";
import userRoutes from "./routes/userRoutes";
import roleRoutes from "./routes/roleRoutes";
import driveRoutes from "./routes/driveRoutes"
import cookieParser from "cookie-parser";
import meetingRoutes from "./routes/meetingRoutes";
import transferRoutes from "./routes/transferRoutes";
import "./utils/cronJob";

dotenv.config();

const PORT = process.env.PORT ?? 5000;
const app = express();

app.use(cors({
  origin: [`${process.env.FRONTEND_URL}`, 'chrome-extension://ngmabalmicmpbdjgabmogmkgdcbcbmmj'],
  credentials: true,
}));
app.use(express.json());
app.use(cookieParser());

databaseConnect();

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

app.use("/api/auth", authRoutes);
app.use("/api/users", userRoutes);
app.use("/api/roles", roleRoutes);
app.use("/api/meetings", meetingRoutes);
app.use("/api/drive", driveRoutes);
app.use("/api/transfer", transferRoutes);

app.get("/", (req, res) => {
  return res.json({
    success: true,
    message: "Your server is up and running....",
    data: {}
  });
});

interface Error {
  stack?: string;
}

app.use((err: Error, req: Request, res: Response, next: NextFunction) => {
  console.error(err.stack);
  res.status(500).send('Something broke!');
});
