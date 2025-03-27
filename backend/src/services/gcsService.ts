import { storage, bucketName } from "../config/gcpConfig";

async function uploadToGCP(fileName: string, fileBuffer: Buffer, destinationPath: string) {
    const bucket = storage.bucket(bucketName);
    const file = bucket.file(destinationPath + fileName);

    const stream = file.createWriteStream({
        metadata: {
            contentType: "image/png",
        },
    });

    return new Promise((resolve, reject) => {
        stream.on("error", (err) => reject(err));
        stream.on("finish", () => resolve(`File uploaded to ${destinationPath}`));
        stream.end(fileBuffer);
    });
}


export { uploadToGCP };
