import mongoose from "mongoose";
import dotenv from "dotenv";

dotenv.config();

const databaseConnect = async () => {
  const databaseUrl = process.env.DATABASE_URL;
  if (!databaseUrl) {
    console.error("DATABASE_URL is not defined in the environment variables");
    return;
  }

  mongoose
    .connect(databaseUrl)
    .then(() => {
      console.log("Connected to database");
    })
    .catch((error) => {
      console.log("Error connecting to database");
      console.error(error);
    });
};

export default databaseConnect;
