import { Storage } from "@google-cloud/storage";
import path from "path";
import { secretVariables } from "../constants/environments.constants";

const storage = new Storage({
  keyFilename: path.join(__dirname, secretVariables.GCP.SERVICE_KEY_PATH ?? ""), 
  projectId: secretVariables.GCP.PROJECT_ID,
});

const bucketName = secretVariables.GCP.BUCKET_NAME?? "cloudcapture-bucket";

export { storage, bucketName };
