import express, { Request, Response, NextFunction } from "express";
import databaseConnect from "./config/database";
import cors from "cors";
import dotenv from "dotenv";
import router from  "./routes/index";
import cookieParser from "cookie-parser";
import "./utils/cronJob";
import { environment } from "./constants/environments.constants";
import logger from "./utils/logger"
dotenv.config();

const PORT = environment.PORT || 8080;
const app = express();

app.use(cors({
  origin: [`${environment.FRONTEND_URL}`, 'chrome-extension://ngmabalmicmpbdjgabmogmkgdcbcbmmj'],
  credentials: true,  // Important: This allows cookies to be sent
  methods: ["GET", "POST", "PUT", "DELETE"],
  allowedHeaders: ["Content-Type", "Authorization"],
}));

app.use(express.json());
app.use(cookieParser());

databaseConnect();

app.use("/web", router);

app.listen(PORT, () => {
  logger.info({functionName:"Server",statusCode:"200", message: `Server running on port ${PORT}`,data:{} });
});

process.on("uncaughtException", (err) => {
  logger.error({ functionName: "Server", statusCode: "500", message: "Uncaught Exception", data: { error: err.message } });
  process.exit(1);
});


process.on("unhandledRejection", (reason) => {
  logger.error({ functionName: "Server", statusCode: "500", message: "Unhandled Rejection", data: { reason } });
});

interface Error {
  stack?: string;
}

app.use((err: Error, req: Request, res: Response, next: NextFunction) => {
  console.error(err.stack);
  res.status(500).send('Something broke!');
});
