import { Storage } from "@google-cloud/storage";
import path from "path";
import { secretVariables } from "../constants/environments.constants";

const storage = new Storage({
    keyFilename: path.join(__dirname, process.env.GCP_SERVICE_KEY_PATH ?? ""), 
    projectId: process.env.GCP_PROJECT_ID,
});

const bucketName = secretVariables.GCP.BUCKET_NAME?? "cloudcapture-bucket";

export { storage, bucketName };
