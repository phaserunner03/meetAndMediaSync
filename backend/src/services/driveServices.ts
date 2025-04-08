
import { google } from "googleapis";
import { secretVariables } from "../constants/environments.constants";
import { Payload } from "../constants/types.constants";
import logger from "../utils/logger";
import { StatusCodes } from "../constants/status-codes.constants";
import { Collections } from '../constants/collections.constants';


const functionName = {
  getCloudCaptureFolder: "getCloudCaptureFolder",
  getAllFiles: "getAllFiles",
  getAllFolders:"getAllFolders",
  getFilesInFolder:"getFilesInFolder",
  deleteFile:"deleteFile",
  fetchRecentMeetingFolders:"fetchRecentMeetingFolders"
};


async function authorize(payload: Payload) {
  const { client_id, client_secret, refresh_token } = payload;
  const client = new google.auth.OAuth2(client_id, client_secret);
  client.setCredentials({ refresh_token });
  return client;
}

async function getCloudCaptureFolder(refresh_token: string) {
  try {
    const payload: Payload = {
      type: "authorized_user",
      client_id: secretVariables.GOOGLE_CLIENT_ID,
      client_secret: secretVariables.GOOGLE_CLIENT_SECRET,
      refresh_token,
    };
    const auth = await authorize(payload);
    const drive = google.drive({ version: "v3", auth });

    const res = await drive.files.list({
      q: "name='CloudCapture' and mimeType='application/vnd.google-apps.folder'",
      fields: "files(id, name)",
    });
    const folderId = res.data.files?.[0]?.id;
    logger.info({
      functionName: functionName.getCloudCaptureFolder,
      statusCode: StatusCodes.OK,
      message: "CloudCapture folder retrieved successfully",
      data: { folderId },
    });
    return folderId;
  } catch (error) {
    logger.error({
      functionName: functionName.getCloudCaptureFolder,
      statusCode: StatusCodes.INTERNAL_SERVER_ERROR,
      message: "Error getting CloudCapture folder",
      data: {
        name: (error as Error).name,
        stack: (error as Error).stack
    }
    });
    throw new Error("Failed to get CloudCapture folder");
  }
}
async function getAllFiles(refresh_token: string) {
  try {
    const folderId = await getCloudCaptureFolder(refresh_token);
    if (!folderId) {
      throw new Error("CloudCapture folder not found.");
    }
    const payload: Payload = {
      type: "authorized_user",
      client_id: secretVariables.GOOGLE_CLIENT_ID,
      client_secret: secretVariables.GOOGLE_CLIENT_SECRET,
      refresh_token,
    };

    const auth = await authorize(payload);
    const drive = google.drive({ version: "v3", auth });

    const foldersRes = await drive.files.list({
      q: `'${folderId}' in parents and mimeType='application/vnd.google-apps.folder'`,
      fields: "files(id, name)",
    });
    const folders = foldersRes.data.files || [];
    const result: Record<string, any> = { folders: {}, allFiles: [] };

    for (const folder of folders) {
      const folderFilesRes = await drive.files.list({
        q: `'${folder.id}' in parents`,
        fields: "files(id, name, webViewLink, webContentLink, mimeType)",
      });

      if (folder.name) {
        result.folders[folder.name] = folderFilesRes.data.files || [];
      }
      result.allFiles.push(...(folderFilesRes.data.files || []));
    }
    logger.info({
      functionName: functionName.getAllFiles,
      statusCode: StatusCodes.OK,
      message: "Fetched all CloudCapture files successfully",
      data: { totalFiles: result.allFiles.length },
    });
    return result;
  } catch (error) {
    logger.error({
      functionName: functionName.getAllFiles,
      statusCode: StatusCodes.INTERNAL_SERVER_ERROR,
      message: "Error fetching CloudCapture files",
      data: {
        name: (error as Error).name,
        stack: (error as Error).stack
    }
    });
    throw new Error("Failed to retrieve files");
  }
}

async function getAllFolders(refresh_token: string) {
    try {
        const folderId = await getCloudCaptureFolder(refresh_token);
        if (!folderId) throw new Error("CloudCapture folder not found.");

        const payload: Payload = {
            type: "authorized_user",
            client_id: secretVariables.GOOGLE_CLIENT_ID,
            client_secret: secretVariables.GOOGLE_CLIENT_SECRET,
            refresh_token,
        };

        const auth = await authorize(payload);
        const drive = google.drive({ version: "v3", auth });

        const foldersRes = await drive.files.list({
            q: `'${folderId}' in parents and mimeType='application/vnd.google-apps.folder'`,
            fields: "files(id, name, modifiedTime)",
        });

        logger.info({
            functionName: functionName.getAllFolders,
            statusCode: StatusCodes.OK,
            message: "Fetched all CloudCapture folders successfully",
            data: { totalFolders: foldersRes.data.files?.length || 0 },
        });

        return foldersRes.data.files || [];
    } catch (error) {
        logger.error({
            functionName: functionName.getAllFolders,
            statusCode: StatusCodes.INTERNAL_SERVER_ERROR,
            message: "Error fetching CloudCapture folders",
            data: {
        name: (error as Error).name,
        stack: (error as Error).stack
    }
        });
        throw new Error("Failed to fetch folders");
    }
}

async function getFilesInFolder(refresh_token: string, folderId: string) {
    try {
        const payload: Payload = {
            type: "authorized_user",
            client_id: secretVariables.GOOGLE_CLIENT_ID,
            client_secret: secretVariables.GOOGLE_CLIENT_SECRET,
            refresh_token,
        };

        const auth = await authorize(payload);
        const drive = google.drive({ version: "v3", auth });

        const filesRes = await drive.files.list({
            q: `'${folderId}' in parents`,
            fields: "files(id, name, webViewLink, webContentLink, mimeType, modifiedTime)",
        });

        logger.info({
            functionName: functionName.getFilesInFolder,
            statusCode: StatusCodes.OK,
            message: "Fetched files from folder successfully",
            data: { folderId, totalFiles: filesRes.data.files?.length || 0 },
        });

        return filesRes.data.files || [];
    } catch (error) {
        logger.error({
            functionName: functionName.getFilesInFolder,
            statusCode: StatusCodes.INTERNAL_SERVER_ERROR,
            message: "Error fetching files from folder",
            data: { folderId, error: error instanceof Error ? error.message : "Unknown error" },
        });
        throw new Error("Failed to retrieve files");
    }
}
async function fetchRecentMeetingFolders(driveFolderId: string) {
    try {
        const payload: Payload = {
            type: "authorized_user",
            client_id: secretVariables.GOOGLE_CLIENT_ID,
            client_secret: secretVariables.GOOGLE_CLIENT_SECRET,
            refresh_token: "",
        };

        const auth = await authorize(payload);
        const drive = google.drive({ version: "v3", auth });
        const twoHoursAgo = new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString();

        const response = await drive.files.list({
            q: `'${driveFolderId}' in parents and mimeType='application/vnd.google-apps.folder' and modifiedTime > '${twoHoursAgo}'`,
            fields: "files(id, name)",
        });

        const recentFolders = response.data.files || [];

        logger.info({
            functionName: functionName.fetchRecentMeetingFolders,
            statusCode: StatusCodes.OK,
            message: "Fetched recent meeting folders successfully",
            data: { driveFolderId, recentFoldersCount: recentFolders.length },
        });

        return recentFolders;
    } catch (error) {
        logger.error({
            functionName: functionName.fetchRecentMeetingFolders,
            statusCode: StatusCodes.INTERNAL_SERVER_ERROR,
            message: "Error fetching recent meeting folders",
            data: {
                driveFolderId,
                error: error instanceof Error ? error.message : "Unknown error",
            },
        });
        throw new Error("Failed to fetch recent meeting folders");
    }
}


async function deleteFile(refresh_token: string, fileId: string) {
    try {
        const payload: Payload = {
            type: "authorized_user",
            client_id: secretVariables.GOOGLE_CLIENT_ID,
            client_secret: secretVariables.GOOGLE_CLIENT_SECRET,
            refresh_token,
        };

        const auth = await authorize(payload);
        const drive = google.drive({ version: "v3", auth });

        await drive.files.delete({ fileId });

        logger.info({
            functionName: functionName.deleteFile,
            statusCode: StatusCodes.OK,
            message: "File deleted successfully",
            data: { fileId },
        });

        return { success: true, message: "File deleted successfully" };
    } catch (error) {
        logger.error({
            functionName: functionName.deleteFile,
            statusCode: StatusCodes.INTERNAL_SERVER_ERROR,
            message: "Error deleting file",
            data: { fileId, error: error instanceof Error ? error.message : "Unknown error" },
        });
        throw new Error("Failed to delete file");
    }
}
const mediaLog = async (
    meetID: string,
    type: "screenshot" | "recording",
    fileUrl: string,
    fileName: string,
    storedIn: "Google Drive" | "GCP",
    movedToGCP: boolean,
    timestamp: string
) => {
    try {
        const fullMeetLink = `https://meet.google.com/${meetID}`;
        const Id = await Collections.MEETINGS.findOne({ meetLink: fullMeetLink });
        if (!Id) {
            throw new Error("Meeting not found");
        }
        const meetingID = Id._id;
        const newMedia = new Collections.MEDIA({
            meetingID,
            type: type || "screenshot",
            fileUrl,
            fileName,
            storedIn: storedIn || "Google Drive",
            movedToGCP: movedToGCP || false,
            timestamp,
        });

        return await newMedia.save();

    } catch (error) {
        if (error instanceof Error) {
            throw new Error(error.message || "Failed to create media record.");
        } else {
            throw new Error("Failed to create media record.");
        }
    }
};

export {getCloudCaptureFolder,getFilesInFolder, getAllFolders, deleteFile,fetchRecentMeetingFolders,getAllFiles,mediaLog};

