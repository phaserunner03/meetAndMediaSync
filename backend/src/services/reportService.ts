import { Collections } from "../constants/collections.constants";

export const fetchMeetings = async (queryParams: any) => {
  const { code, roleId, startDate, endDate, drive, gcp } = queryParams;
  //Add meeting title and scheduled by 
  
      let meetings;
  
      if (!code && !roleId && !startDate && !endDate && !drive && !gcp) {
        meetings = await Collections.MEETINGS.find()
          .populate<{ scheduledBy: { _id: string; name: string; email: string; role: { _id: string; name: string } } }>("scheduledBy", "name email role") // Populate User with name, email, and role
          .populate({
            path: "scheduledBy",
            populate: { path: "role", select: "name" }, // Populate Role with name
          })
          .lean();
  
        const detailedMeetings = await Promise.all(
          meetings.map(async (meeting) => {
            const meetingDetails = await Collections.MEETING_DETAILS.findOne({ meetingID: meeting._id }).lean();
            const media = await Collections.MEDIA.find({ meetingID: meeting._id }).lean();
            const storageLogs = await Collections.STORAGE_LOG.find({ meetingID: meeting._id }).lean();
  
            return {
              ...meeting,
              meetingDetails,
              media,
              storageLogs,
            };
          })
        );
  
        return detailedMeetings;
      }
  
      // Query parameters present: Filter results
      const query: Record<string, any> = {};
      if (code) query["meetLink"] = { $regex: `https://meet.google.com/${code}`, $options: "i" };
  
      meetings = await Collections.MEETINGS.find(query)
        .populate<{ scheduledBy: { _id: string; name: string; email: string; displayName?: string; photoURL?: string; role: { _id: string; name: string } } }>("scheduledBy", "name email displayName photoURL role") // Populate User with name, email, displayName, photoURL, and role
        .populate({
          path: "scheduledBy",
          populate: { path: "role", select: "name" }, // Populate Role with name
        })
        .lean();
  
      const filteredMeetings = await Promise.all(
        meetings.map(async (meeting) => {
          const meetingDetails = await Collections.MEETING_DETAILS.findOne({ meetingID: meeting._id }).lean();
          const media = await Collections.MEDIA.find({ meetingID: meeting._id }).lean();
          const storageLogs = await Collections.STORAGE_LOG.find({ meetingID: meeting._id }).lean();
  
          // Separate media into Google Drive and GCP arrays using movedToGCP
          const googleDriveMedia = media
            .filter((item) => !item.movedToGCP)
            .map(({ _id, type, fileUrl, timestamp }) => ({
              id: _id,
              type,
              fileUrl,
              timestamp,
            }));
  
          const gcpMedia = media
            .filter((item) => item.movedToGCP)
            .map(({ _id, type, fileUrl, timestamp }) => ({
              id: _id,
              type,
              fileUrl,
              timestamp,
            }));
  
          // Identify media in GCP but not in storageLogs
          const gcpMediaNotInStorageLogs = gcpMedia.filter(
            (gcpItem) =>
              !storageLogs.some((log) => log.fileUrl === gcpItem.fileUrl)
          );
  
          // If drive is "uploaded", exclude meetings without Google Drive media
          if (drive === "uploaded" && googleDriveMedia.length === 0) {
            return null;
          }
  
          // If gcp is "uploaded", exclude meetings with empty storageLogs
          if (gcp === "uploaded" && storageLogs.length === 0) {
            return null;
          }
  
          // Apply additional filters
          if (startDate || endDate) {
            const meetingStartTime = new Date(meetingDetails?.startTime || 0);
            const meetingEndTime = new Date(meetingDetails?.endTime || 0);
  
            // Convert startDate and endDate to Date objects without time
            const startOfDay = startDate ? new Date(startDate as string) : null;
            const endOfDay = endDate ? new Date(endDate as string) : null;
  
            if (startOfDay) {
              startOfDay.setHours(0, 0, 0, 0); // Set to start of the day
            }
            if (endOfDay) {
              endOfDay.setHours(23, 59, 59, 999); // Set to end of the day
            }
  
            if (
              (startOfDay && meetingEndTime < startOfDay) || // Meeting ends before the start date
              (endOfDay && meetingStartTime > endOfDay) // Meeting starts after the end date
            ) {
              return null;
            }
          }
  
          const filteredStorageLogs = storageLogs.map(({ _id, fileName, fileUrl, transferredAt }) => ({
            id: _id,
            fileName,
            fileUrl,
            transferredAt,
          }));
  
          // Filter by role if provided
          if (roleId) {
            if (!meeting.scheduledBy) return null;
            const userRole =
              meeting.scheduledBy && "role" in meeting.scheduledBy
                ? (meeting.scheduledBy.role as { _id: string })._id.toString()
                : null;
            if (userRole !== roleId) return null;
          }
  
          // Remove unnecessary metadata from the meeting object
          const sanitizedMeeting = {
            id: meeting._id,
            title: meeting.title,
            description: meeting.description,
            location: meeting.location,
            meetLink: meeting.meetLink,
            scheduledBy: {
              id: ((meeting.scheduledBy as unknown) as { _id: string })?._id,
              email: ((meeting.scheduledBy as unknown) as { email: string })?.email,
              displayName: (meeting.scheduledBy as { displayName?: string })?.displayName,
              photoURL: meeting.scheduledBy?.photoURL,
              role: {
                id: meeting.scheduledBy?.role._id,
                name: meeting.scheduledBy?.role.name,
              },
            },
            meetingDetails: {
              meetingDate: meetingDetails?.meetingDate,
              meetingHistory: meetingDetails?.meetingHistory,
              meetingType: meetingDetails?.meetingType,
              participants: meetingDetails?.participants,
              startTime: meetingDetails?.startTime,
              endTime: meetingDetails?.endTime,
            },
            googleDriveMedia, // Media not moved to GCP
            gcpMedia, // Media moved to GCP
            gcpMediaNotInStorageLogs, // Media in GCP but not in storageLogs
            storageLogs: filteredStorageLogs,
          };
  
          return sanitizedMeeting;
        })
      );
  
      // Remove null values from the filtered meetings
      const finalMeetings = filteredMeetings.filter((meeting) => meeting !== null);
  
      return (finalMeetings);
};

// const { code, roleId, startDate, endDate, drive, gcp } = queryParams;
// //   console.log("Query Params:", queryParams);
//   let query: Record<string, any> = {};

//   if (code) query["meetLink"] = { $regex: `https://meet.google.com/${code}`, $options: "i" };

//   let meetings = await Meeting.find(query)
//       .populate<{ scheduledBy: { _id: string; name: string; email: string; displayName?: string; photoURL?: string; role: { _id: string; name: string } } }>("scheduledBy", "name email displayName photoURL role") // Populate User with name, email, displayName, photoURL, and role
//       .populate({
//         path: "scheduledBy",
//         populate: { path: "role", select: "name" }, // Populate Role with name
//       })
//       .lean();

//   const filteredMeetings = await Promise.all(
//     meetings.map(async (meeting) => {
//       const meetingDetails = await MeetingDetails.findOne({ meetingID: meeting._id }).lean();
//       const media = await Media.find({ meetingID: meeting._id }).lean();
//       const storageLogs = await StorageLog.find({ meetingID: meeting._id }).lean();

//       const googleDriveMedia = media.filter((item) => !item.movedToGCP);
//       const gcpMedia = media.filter((item) => item.movedToGCP);
//       const gcpMediaNotInStorageLogs = gcpMedia.filter(
//         (gcpItem) => !storageLogs.some((log) => log.fileUrl === gcpItem.fileUrl)
//       );

//       if ((drive === "uploaded" && googleDriveMedia.length === 0) || (gcp === "uploaded" && storageLogs.length === 0)) {
//         return null;
//       }

//       if (startDate || endDate) {
//         const meetingStartTime = new Date(meetingDetails?.startTime || 0);
//         const meetingEndTime = new Date(meetingDetails?.endTime || 0);

//         const startOfDay = startDate ? new Date(startDate as string) : null;
//         const endOfDay = endDate ? new Date(endDate as string) : null;

//         if (startOfDay) startOfDay.setHours(0, 0, 0, 0);
//         if (endOfDay) endOfDay.setHours(23, 59, 59, 999);

//         if ((startOfDay && meetingEndTime < startOfDay) || (endOfDay && meetingStartTime > endOfDay)) {
//           return null;
//         }
//       }

//       if (roleId && meeting.scheduledBy && "role" in meeting.scheduledBy
//         ? (meeting.scheduledBy.role as { _id: string })._id.toString()
//         : null !== roleId) {
//         return null;
//       }
//       console.log("Meeting Details:", meetingDetails);
//       console.log("Google Drive Media:", googleDriveMedia);
//       console.log("GCP Media:", gcpMedia);
//       console.log("GCP Media Not in Storage Logs:", gcpMediaNotInStorageLogs);
//       console.log("Storage Logs:", storageLogs);
//       console.log("Meeting:", meeting);
//       return {
//         id: meeting._id,
//         title: meeting.title,
//         description: meeting.description,
//         location: meeting.location,
//         meetLink: meeting.meetLink,
//         scheduledBy: {
//           id: meeting.scheduledBy._id,
//           email: meeting.scheduledBy.email,
//           displayName: meeting.scheduledBy.displayName,
//           photoURL: meeting.scheduledBy.photoURL,
//           role: {
//             id: meeting.scheduledBy.role._id,
//             name: meeting.scheduledBy.role.name,
//           },
//         },
//         meetingDetails: {
//           meetingDate: meetingDetails?.meetingDate,
//           meetingHistory: meetingDetails?.meetingHistory,
//           meetingType: meetingDetails?.meetingType,
//           participants: meetingDetails?.participants,
//           startTime: meetingDetails?.startTime,
//           endTime: meetingDetails?.endTime,
//         },
//         googleDriveMedia,
//         gcpMedia,
//         gcpMediaNotInStorageLogs,
//         storageLogs: storageLogs.map(({ _id, fileName, fileUrl, transferredAt }) => ({
//           id: _id,
//           fileName,
//           fileUrl,
//           transferredAt,
//         })),
//       };
//     })
//   );

//   return filteredMeetings.filter(Boolean);
