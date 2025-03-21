import { getAllFolders, getFilesInFolder } from "./driveServices";
import { uploadToGCP } from "./gcsService";
import moment from "moment";
import { google } from "googleapis";
import { Readable } from "stream";

async function transferScreenshotsToGCP(refresh_token: string, organizerEmail: string) {
    try {
        const folders = await getAllFolders(refresh_token);
        const twoHoursAgo = moment().subtract(2, "hours");

        for (const folder of folders) {
            await processFolder(folder, twoHoursAgo, refresh_token, organizerEmail);
        }
        console.log("Transfer complete.");
    } catch (error) {
        console.error("Error in transfer:", error);
        throw new Error("Failed to transfer screenshots to GCP");
    }
}

async function processFolder(folder: any, twoHoursAgo: moment.Moment, refresh_token: string, organizerEmail: string) {
    const meetingId = folder.name;
    
    const meetingCreatedTime = moment(folder.createdTime);

    if (meetingCreatedTime.isBefore(twoHoursAgo)) return; // Skip old meetings

    if (!folder.id) {
        console.warn(`Folder ${folder.name} does not have an id, skipping.`);
        return;
    }
    const files = await getFilesInFolder(refresh_token, folder.id);
    const datePath = moment().format("YYYY-MM-DD");
    const gcpPath = `${datePath}/${organizerEmail}/${meetingId}/`;

    for (const file of files) {
        await processFile(file, refresh_token, gcpPath);
    }
}

async function processFile(file: any, refresh_token: string, gcpPath: string) {
    if (file.id) {
        const fileData = await fetchFileBuffer(refresh_token, file.id);
        if (file.name) {
            await uploadToGCP(file.name, fileData, gcpPath);
        } else {
            console.warn(`File id ${file.id} does not have a name, skipping.`);
        }
    } else {
        console.warn(`File ${file.name} does not have an id, skipping.`);
    }
}

async function fetchFileBuffer(refresh_token: string, fileId: string): Promise<Buffer> {
    // Implement file download from Drive and convert it into a buffer
    const auth = new google.auth.OAuth2(
        process.env.GOOGLE_CLIENT_ID,
        process.env.GOOGLE_CLIENT_SECRET
    );
    auth.setCredentials({ refresh_token });

    const drive = google.drive({ version: "v3", auth });

    try {
        const response = await drive.files.get(
            {
                fileId,
                alt: "media", // Fetch file content directly
            },
            { responseType: "stream" } // Stream response to handle large files
        );

        return new Promise<Buffer>((resolve, reject) => {
            const chunks: Buffer[] = [];
            const stream = response.data as Readable;

            stream.on("data", (chunk) => chunks.push(chunk));
            stream.on("end", () => resolve(Buffer.concat(chunks)));
            stream.on("error", (err) => reject(err));
        });
    } catch (error) {
        console.error("Error fetching file buffer:", error);
        throw new Error("Failed to fetch file from Google Drive");
    }
}

export { transferScreenshotsToGCP };
