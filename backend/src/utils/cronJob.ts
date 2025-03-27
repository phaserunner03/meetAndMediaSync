import cron from "node-cron";
import { transferScreenshotsToGCP } from "../services/transferService";
import { Collections } from "../constants/collections.constants";
import { Document} from "mongoose";
import { CronJobFrequencies } from "../constants/cron-jobs.constants";

interface RoleDocument extends Document {
    name: string;
    permissions: string[];
}

cron.schedule(CronJobFrequencies.EVERY_TWO_HOURS, async () => { 
    const users = await Collections.USER.find({ refreshToken: { $exists: true } })
                        .populate<{ role: RoleDocument }>("role", "name permissions"); // Fetch users with refreshToken

    for (const user of users) {
        if (user.role.permissions.includes("groupMeeting")) {
            console.log(`Transferring screenshots for user: ${user.email}`);
            await transferScreenshotsToGCP(user.refreshToken, user.email);
        } else {
            console.log(`User ${user.email} does not have groupmeeting permission. Skipping transfer.`);
        }
    }

    console.log("Scheduled transfer task completed.");
});
