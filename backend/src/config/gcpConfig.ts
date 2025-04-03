import { Storage } from "@google-cloud/storage";
import path from "path";
import { secretVariables } from "../constants/environments.constants";

const storage = new Storage();

const bucketName = secretVariables.GCP.BUCKET_NAME?? "cloudcapture-bucket";

export { storage, bucketName };
