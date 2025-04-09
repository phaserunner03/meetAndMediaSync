import { Collections } from "../constants/collections.constants";

const populateMeetingUser = [
  {
    path: "scheduledBy",
    select: "name email displayName photoURL role",
    populate: { path: "role", select: "name" },
  },
];

const getMeetingExtras = async (meetingID: string) => {
  const [meetingDetails, media, storageLogs] = await Promise.all([
    Collections.MEETING_DETAILS.findOne({ meetingID }).lean(),
    Collections.MEDIA.find({ meetingID }).lean(),
    Collections.STORAGE_LOG.find({ meetingID }).lean(),
  ]);

  return { meetingDetails, media, storageLogs };
};

const isWithinDateRange = (
  meetingDetails: any,
  startTime?: string,
  endTime?: string
) => {
  // Parse the provided date strings into JavaScript Date objects.
  // The input format is expected to be: "Tue Mar 25 2025 00:00:00 GMT+0530 (India Standard Time)"
  const start = startTime ? new Date(startTime) : null;
  const end = endTime ? new Date(endTime) : null;

  if (start) start.setHours(0, 0, 0, 0); // Set start date to the beginning of the day
  if (end) end.setHours(23, 59, 59, 999); // Set end date to the end of the day

  const meetingStart = new Date(meetingDetails?.startTime || 0);
  const meetingEnd = new Date(meetingDetails?.endTime || 0);

  if ((start && meetingEnd < start) || (end && meetingStart > end)) {
    return false;
  }
  return true;
};

const sanitizeMeeting = (
  meeting: any,
  meetingDetails: any,
  googleDriveMedia: any[],
  gcpMedia: any[],
  gcpMediaNotInStorageLogs: any[],
  storageLogs: any[]
) => {
  return {
    id: meeting._id,
    title: meeting.title,
    description: meeting.description,
    location: meeting.location,
    meetLink: meeting.meetLink,
    scheduledBy: {
      id: meeting.scheduledBy?._id,
      email: meeting.scheduledBy?.email,
      displayName: meeting.scheduledBy?.displayName,
      photoURL: meeting.scheduledBy?.photoURL,
      role: {
        id: meeting.scheduledBy?.role?._id,
        name: meeting.scheduledBy?.role?.name,
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
    googleDriveMedia,
    gcpMedia,
    gcpMediaNotInStorageLogs,
    storageLogs: storageLogs.map(({ _id, fileName, fileUrl, transferredAt }) => ({
      id: _id,
      fileName,
      fileUrl,
      transferredAt,
    })),
  };
};

export const fetchMeetings = async (queryParams: any) => {
  const { title, scheduledBy, roleId, startTime, endTime, drive, gcp } = queryParams;
  const hasFilters = title || scheduledBy || roleId || startTime || endTime || drive || gcp;

  const query: Record<string, any> = {};

  if (title) {
    query["title"] = { $regex: title, $options: "i" };
  }

  // Ensure query fetches all past meetings when no filters are applied
//   if (!hasFilters) {
//     query["meetingDetails.endTime"] = { $lt: new Date() }; // Only past meetings
//   }

  let meetings = await Collections.MEETINGS.find(hasFilters ? query : {})
    .populate(populateMeetingUser)
    .lean();
  // Apply scheduledBy filter after populating
  if (scheduledBy) {
    meetings = meetings.filter((meeting) => {
      const scheduledByUser = meeting.scheduledBy as { email?: string };
      return scheduledByUser?.email?.toLowerCase().includes(scheduledBy.toLowerCase());
    });
  }

  console.log("meetings", meetings, "query", query);

  const processedMeetings = await Promise.all(
    meetings.map(async (meeting) => {
      const { meetingDetails, media, storageLogs } = await getMeetingExtras(meeting?._id as string);

      const googleDriveMedia = media
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

      const gcpMediaNotInStorageLogs = gcpMedia.filter(
        (gcpItem) =>
          !storageLogs.some((log) => log.fileUrl === gcpItem.fileUrl)
      );

      // Drive logic
      if (drive === "uploaded" && media.length === 0) return null;
      if (drive === "no media" && media.length !== 0) return null;

      // GCP logic
      if (gcp) {
        if (media.length === 0) return null;
        if (gcp === "transferred" && media.length !== storageLogs.length) return null;
        if (gcp === "pending" && media.length === storageLogs.length) return null;
        if (gcp === "failed" && storageLogs.length !== 0 ) return null;
      }

      // Date range filter
      if (!isWithinDateRange(meetingDetails, startTime, endTime)) return null;

      // Past meetings filter
      if (new Date(meetingDetails?.endTime || 0) >= new Date()) return null;

      // Role ID filter
      if (roleId) {
        if (!meeting.scheduledBy) return null;
        const userRole =
          meeting.scheduledBy && "role" in meeting.scheduledBy
            ? (meeting.scheduledBy.role as { _id: string })._id.toString()
            : null;
        if (userRole !== roleId) return null;
      }

      return sanitizeMeeting(
        meeting,
        meetingDetails,
        googleDriveMedia,
        gcpMedia,
        gcpMediaNotInStorageLogs,
        storageLogs
      );
    })
  );

  // Ensure all past meetings are returned when no filters are applied
  return hasFilters
    ? processedMeetings.filter((m) => m !== null)
    : processedMeetings.filter((m) => m !== null && new Date(m.meetingDetails.endTime) < new Date());
};
