import express, { Request, Response, NextFunction } from "express";
import databaseConnect from "./config/database";
import cors from "cors";
import dotenv from "dotenv";
import router from  "./routes/index";
import cookieParser from "cookie-parser";
import "./utils/cronJob";
dotenv.config();

const PORT = process.env.PORT ?? 8080;
const app = express();

app.use(cors({
  origin: [`${process.env.FRONTEND_URL}`, 'chrome-extension://ngmabalmicmpbdjgabmogmkgdcbcbmmj'],
  credentials: true,  
  methods: ["GET", "POST", "PUT", "DELETE"],
  allowedHeaders: ["Content-Type", "Authorization"],
}));

app.use(express.json());
app.use(cookieParser());

databaseConnect();

app.use("/web", router);

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

interface Error {
  stack?: string;
}

app.use((err: Error, req: Request, res: Response, next: NextFunction) => {
  console.error(err.stack);
  res.status(500).send('Something broke!');
});
