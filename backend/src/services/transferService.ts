import { getAllFolders, getFilesInFolder } from "./driveServices";
import { uploadToGCP } from "./gcsService";
import moment from "moment";
import { google } from "googleapis";
import { secretVariables } from "../constants/environments.constants";
import logger from "../utils/logger";
import { Collections } from "../constants/collections.constants";
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
            console.log(file);
            await processFile(file ,folder ,refresh_token , gcpPath);
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

async function processFile(file: any, folder: any ,refresh_token: string, gcpPath: string) {
  try {
    if (file.id) {
        const Url=`https://drive.google.com/uc?id=${file.id}`;
        const existingLog = await Collections.STORAGE_LOG.findOne({ fileUrl: Url});
        if (existingLog) {
            console.log(`File ${file.name} already exists in StorageLog, skipping upload.`);
            return;
        }
        logger.info({
          functionName: functionName.processFile,
          statusCode: StatusCodes.OK,
          message: "Processing file",
          data: { fileId: file.id, fileName: file.name },
        });
        const fileData = await fetchFileBuffer(refresh_token, file.id);
        if (file.name) {
            const fileUrl = await uploadToGCP(file.name, fileData, gcpPath);
             logger.info({
               functionName: functionName.processFile,
               statusCode: StatusCodes.OK,
               message: "File uploaded to GCP",
               data: { fileName: file.name, gcpPath },
               });

            const link=`https://meet.google.com/${folder.name}`;
            const meetingID =await Collections.MEETINGS.findOne({ meetLink: link });
            if (!meetingID) {
                console.warn(`Meeting not found for link ${link}, skipping.`);
                return;
            }
            
            const storageLog = new Collections.STORAGE_LOG({
                meetingID: meetingID?._id,
                fileName: file.name,
                fileUrl: Url,
                transferredAt: new Date(),
            });

            await storageLog.save();
            const existingMedia = await Collections.MEDIA.findOne({ fileUrl: Url });
            if (existingMedia) {
                existingMedia.storedIn = "GCP";
                existingMedia.movedToGCP = true;
                await existingMedia.save();
            }
        } 
    }
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
