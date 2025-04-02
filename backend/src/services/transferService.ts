import { getAllFolders, getFilesInFolder } from "./driveServices";
import { uploadToGCP } from "./gcsService";
import moment from "moment";
import { google } from "googleapis";
import { secretVariables } from "../constants/environments.constants";
import logger from "../utils/logger";
import { StatusCodes } from "../constants/status-codes.constants";

const functionName = {
  transferScreenshotsToGCP: "transferScreenshotsToGCP",
  processFolder: "processFolder",
  processFile: "processFile",
  fetchFileBuffer: "fetchFileBuffer",
};

async function transferScreenshotsToGCP(
  refresh_token: string,
  organizerEmail: string
) {
  try {
    const folders = await getAllFolders(refresh_token);
    const twoHoursAgo = moment().subtract(2, "hours");

    for (const folder of folders) {
      await processFolder(folder, twoHoursAgo, refresh_token, organizerEmail);
    }
    logger.info({
      functionName: functionName.transferScreenshotsToGCP,
      statusCode: StatusCodes.OK,
      message: "Transfer complete",
      data: { organizerEmail },
    });
  } catch (error) {
    logger.error({
      functionName: functionName.transferScreenshotsToGCP,
      statusCode: StatusCodes.INTERNAL_SERVER_ERROR,
      message: "Error in transfer",
      data: {
        name: (error as Error).name,
        stack: (error as Error).stack
    }
    });
    throw new Error("Failed to transfer screenshots to GCP");
  }
}

async function processFolder(
  folder: any,
  twoHoursAgo: moment.Moment,
  refresh_token: string,
  organizerEmail: string
) {
  try {
    if (!folder.id) {
      logger.warn({
        functionName: functionName.processFolder,
        statusCode: StatusCodes.BAD_REQUEST,
        message: "Folder does not have an ID, skipping",
        data: { folderName: folder.name },
      });
      return;
    }

    logger.info({
      functionName: functionName.processFolder,
      statusCode: StatusCodes.OK,
      message: "Processing folder",
      data: { folderId: folder.id, folderName: folder.name },
    });

    const files = await getFilesInFolder(refresh_token, folder.id);
    const datePath = moment().format("YYYY-MM-DD");
    const gcpPath = `${datePath}/${organizerEmail}/${folder.name}/`;

    for (const file of files) {
      const fileModifiedTime = moment(file.modifiedTime);
      if (fileModifiedTime.isAfter(twoHoursAgo)) {
        await processFile(file, refresh_token, gcpPath);
      }
    }
  } catch (error) {
    logger.error({
      functionName: functionName.processFolder,
      statusCode: StatusCodes.INTERNAL_SERVER_ERROR,
      message: "Error processing folder",
      data: {
        folderName: folder.name,
        error: error instanceof Error ? error.message : "Unknown error",
      },
    });
  }
}

async function processFile(file: any, refresh_token: string, gcpPath: string) {
    try {
        if (!file.id) {
          logger.warn({
            functionName: functionName.processFile,
            statusCode: StatusCodes.BAD_REQUEST,
            message: "File does not have an ID, skipping",
            data: { fileName: file.name },
          });
          return;
        }
    
        logger.info({
          functionName: functionName.processFile,
          statusCode: StatusCodes.OK,
          message: "Processing file",
          data: { fileId: file.id, fileName: file.name },
        });
    
        const fileData = await fetchFileBuffer(refresh_token, file.id);
        await uploadToGCP(file.name, fileData, gcpPath);
    
        logger.info({
          functionName: functionName.processFile,
          statusCode: StatusCodes.OK,
          message: "File uploaded to GCP",
          data: { fileName: file.name, gcpPath },
        });
      } catch (error) {
        logger.error({
          functionName: functionName.processFile,
          statusCode: StatusCodes.INTERNAL_SERVER_ERROR,
          message: "Error processing file",
          data: { fileName: file.name, error: error instanceof Error ? error.message : "Unknown error" },
        });
      }
}

async function fetchFileBuffer(
  refresh_token: string,
  fileId: string
): Promise<Buffer> {
    try {
        const auth = new google.auth.OAuth2(
          secretVariables.GOOGLE_CLIENT_ID,
          secretVariables.GOOGLE_CLIENT_SECRET
        );
        auth.setCredentials({ refresh_token });
    
        const drive = google.drive({ version: "v3", auth });
    
        logger.info({
          functionName: functionName.fetchFileBuffer,
          statusCode: StatusCodes.OK,
          message: "Fetching file from Google Drive",
          data: { fileId },
        });
    
        const response = await drive.files.get(
          { fileId, alt: "media" },
          { responseType: "stream" }
        );
    
        return new Promise<Buffer>((resolve, reject) => {
          const chunks: Buffer[] = [];
          response.data.on("data", (chunk) => chunks.push(chunk));
          response.data.on("end", () => resolve(Buffer.concat(chunks)));
          response.data.on("error", (err) => reject(err));
        });
      } catch (error) {
        logger.error({
          functionName: functionName.fetchFileBuffer,
          statusCode: StatusCodes.INTERNAL_SERVER_ERROR,
          message: "Error fetching file buffer",
          data: { fileId, error: error instanceof Error ? error.message : "Unknown error" },
        });
        throw new Error("Failed to fetch file from Google Drive");
      }
}

export { transferScreenshotsToGCP };
