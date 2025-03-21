import { Storage } from "@google-cloud/storage";
import path from "path";

const storage = new Storage({
  keyFilename: path.join(__dirname, process.env.GCP_SERVICE_KEY_PATH ?? ""), // Path to downloaded JSON
  projectId: process.env.GCP_PROJECT_ID,
});

const bucketName = process.env.GCP_BUCKET_NAME ?? "cloudcapture-bucket";

export { storage, bucketName };
