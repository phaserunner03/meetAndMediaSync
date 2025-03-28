import {google} from 'googleapis';
import { secretVariables } from '../constants/environments.constants';
import {Payload} from '../constants/types.constants';

async function authorize(payload: Payload) {
    const { client_id, client_secret, refresh_token } = payload;
    const client = new google.auth.OAuth2(client_id, client_secret);
    client.setCredentials({ refresh_token });
    return client;
}

async function getCloudCaptureFolder(refresh_token:string){
    const payload: Payload = {
        type: "authorized_user",
        client_id: secretVariables.GOOGLE_CLIENT_ID,
        client_secret: secretVariables.GOOGLE_CLIENT_SECRET,
        refresh_token,
    };
    const auth = await authorize(payload);
    const drive = google.drive({ version: "v3", auth });

    try{
        const res = await drive.files.list({
            q: "name='CloudCapture' and mimeType='application/vnd.google-apps.folder'",
            fields: "files(id, name)",
        })
        return res.data.files?.[0]?.id;
    }
    catch (error) {
        console.error("Error getting/creating CloudCapture folder:", error);
        throw new Error("Failed to get CloudCapture folder");
    }


}
async function getAllFiles(refresh_token:string){
    const folderId = await getCloudCaptureFolder(refresh_token)
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

    try {
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

        return result;
    } catch (error) {
        console.error("Error fetching CloudCapture files:", error);
        throw new Error("Failed to retrieve files");
    }
}

async function getAllFolders(refresh_token:string){
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

    return foldersRes.data.files || [];

}

async function getFilesInFolder(refresh_token:string, folderId:string){
    
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
        fields: "files(id, name, webViewLink, webContentLink, mimeType,modifiedTime)",
    });

    return filesRes.data.files || [];

}

async function fetchRecentMeetingFolders(driveFolderId: string) {
    const payload: Payload = {
        type: "authorized_user",
        client_id: secretVariables.GOOGLE_CLIENT_ID,
        client_secret: secretVariables.GOOGLE_CLIENT_SECRET,
        refresh_token: "",
    }

    const auth = await authorize(payload);
    const drive = google.drive({ version: "v3", auth });
    const twoHoursAgo = new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString();

    const response = await drive.files.list({
        q: `'${driveFolderId}' in parents and mimeType='application/vnd.google-apps.folder' and modifiedTime > '${twoHoursAgo}'`,
        fields: "files(id, name)",
    });

    return response.data.files || [];
}

async function deleteFile(refresh_token: string, fileId: string) {
    const payload: Payload = {
        type: "authorized_user",
        client_id: secretVariables.GOOGLE_CLIENT_ID,
        client_secret: secretVariables.GOOGLE_CLIENT_SECRET,
        refresh_token,
    };

    const auth = await authorize(payload);

    const drive = google.drive({ version: "v3", auth });
    await drive.files.delete({ fileId });
}
export {getCloudCaptureFolder,getFilesInFolder, getAllFolders, deleteFile,fetchRecentMeetingFolders,getAllFiles};