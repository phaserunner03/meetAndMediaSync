import { Storage } from "@google-cloud/storage";
import path from "path";

const storage = new Storage();

const bucketName = process.env.GCP_BUCKET_NAME ?? "cloudcapture-bucket";

export { storage, bucketName };
