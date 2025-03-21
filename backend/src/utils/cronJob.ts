// import cron from "node-cron";
// import { transferScreenshotsToGCP } from "../services/transferService";
// import { getAllScheduledMeetings } from "../services/meetingService"; // Fetch meetings from MongoDB

// cron.schedule("0 */2 * * *", async () => {
//     console.log("Running scheduled task to transfer screenshots to GCP...");

//     const meetings = await getAllScheduledMeetings(); // Fetch meetings scheduled in last 2 hours

//     for (const meeting of meetings) {
//         await transferScreenshotsToGCP(meeting.refresh_token, meeting.organizerEmail);
//     }

//     console.log("Scheduled transfer task completed.");
// });
