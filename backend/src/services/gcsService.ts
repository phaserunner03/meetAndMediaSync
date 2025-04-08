import { storage, bucketName } from "../config/gcpConfig";
import  logger  from "../utils/logger";
import { StatusCodes } from "../constants/status-codes.constants";

const functionName = {
    uploadToGCP: "uploadToGCP",
};

async function uploadToGCP(fileName: string, fileBuffer: Buffer, destinationPath: string) {
    try {
        const bucket = storage.bucket(bucketName);
        const file = bucket.file(`${destinationPath}${fileName}`);
        const stream = file.createWriteStream({
            metadata: {
                contentType: "image/png",
            },
        });

        return new Promise((resolve, reject) => {
            stream.on("error", (err) => {
                logger.error({
                    functionName: functionName.uploadToGCP,
                    statusCode: StatusCodes.INTERNAL_SERVER_ERROR,
                    message: "Error uploading file to GCP",
                    data: { fileName, destinationPath, error: err instanceof Error ? err.message : "Unknown error" },
                });
                reject(err instanceof Error ? err : new Error(String(err)));
            });

            stream.on("finish", async () => {
                try {
                    const [metadata] = await file.getMetadata();
                    const authenticatedUrl = `https://storage.cloud.google.com/${bucketName}/${destinationPath}${fileName}`;

                    const detailedMetadata = {
                        ...metadata,
                        authenticatedUrl,
                    };

                    console.log("File metadata with authenticated URL:", detailedMetadata);

                    logger.info({
                        functionName: functionName.uploadToGCP,
                        statusCode: StatusCodes.OK,
                        message: "File uploaded successfully to GCP with metadata",
                        data: detailedMetadata,
                    });

                    resolve(detailedMetadata);
                } catch (err) {
                    logger.error({
                        functionName: functionName.uploadToGCP,
                        statusCode: StatusCodes.INTERNAL_SERVER_ERROR,
                        message: "Error retrieving file metadata after upload",
                        data: { fileName, destinationPath, error: err instanceof Error ? err.message : "Unknown error" },
                    });
                    reject(err instanceof Error ? err : new Error(String(err)));
                }
            });

            stream.end(fileBuffer);
        });
    } catch (error) {
        logger.error({
            functionName: functionName.uploadToGCP,
            statusCode: StatusCodes.INTERNAL_SERVER_ERROR,
            message: "Unexpected error during GCP upload",
            data: {  error: error instanceof Error ? error.message : "Unknown error" },
        });
        throw new Error("Failed to upload file to GCP");
    }
} 


export { uploadToGCP };
