import { google, calendar_v3 } from "googleapis";
import { secretVariables } from "../constants/environments.constants";
import { Payload } from "../constants/types.constants";
import logger from "../utils/logger";
import { StatusCodes } from "../constants/status-codes.constants";

const functionName = {
  authorize: "authorize",
  createEvent: "createEvent",
  listEvents: "listEvents",
  checkUserAvailability: "checkUserAvailability",
  updateEvent: "updateEvent",
  deleteEvent: "deleteEvent",
};

async function authorize(payload: Payload) {
  try {
    const { client_id, client_secret, refresh_token } = payload;
    const client = new google.auth.OAuth2(client_id, client_secret);
    client.setCredentials({ refresh_token });
    return client;
  } catch (error) {
    logger.error({
      functionName: functionName.authorize,
      statusCode: StatusCodes.INTERNAL_SERVER_ERROR,
      message: "Error authorizing user",
      data: { error: error instanceof Error ? error.message : "Unknown error" },
    });
    throw new Error("Failed to authorize user");
  }
}

export async function createEvent(
  refreshToken: string,
  eventData: calendar_v3.Schema$Event
) {
  try {
    const payload: Payload = {
      type: "authorized_user",
      client_id: secretVariables.GOOGLE_CLIENT_ID,
      client_secret: secretVariables.GOOGLE_CLIENT_SECRET,
      refresh_token: refreshToken,
    };
    const auth = await authorize(payload);
    const calendar = google.calendar({ version: "v3", auth });

    const response = await calendar.events.insert(<
      calendar_v3.Params$Resource$Events$Insert
    >{
      calendarId: "primary",
      resource: eventData,
      conferenceDataVersion: 1,
      sendNotifications: true,
    });

    logger.info({
      functionName: functionName.createEvent,
      statusCode: StatusCodes.OK,
      message: "Event created successfully",
      data: { event: response.data },
    });
    return response.data;
  } catch (error) {
    logger.error({
      functionName: functionName.createEvent,
      statusCode: StatusCodes.INTERNAL_SERVER_ERROR,
      message: "Error creating event",
      data: { error: error instanceof Error ? error.message : "Unknown error" },
    });
    throw new Error("Failed to create the event");
  }
}

export async function listEvents(
  refreshToken: string,
  year: number,
  month: number
) {
  try {
    const payload: Payload = {
      type: "authorized_user",
      client_id: secretVariables.GOOGLE_CLIENT_ID,
      client_secret: secretVariables.GOOGLE_CLIENT_SECRET,
      refresh_token: refreshToken,
    };

    const auth = await authorize(payload);
    const calendar = google.calendar({ version: "v3", auth });

    const timeZone = "Asia/Kolkata";
    const timeMin = new Date(Date.UTC(year, month - 1, 1, 0, 0, 0));
    timeMin.setMinutes(timeMin.getMinutes() + 330);

    const timeMax = new Date(Date.UTC(year, month, 1, 0, 0, 0));
    timeMax.setMinutes(timeMax.getMinutes() + 330);

    const response = await calendar.events.list({
      calendarId: "primary",
      timeMin: timeMin.toISOString(),
      timeMax: timeMax.toISOString(),
      maxResults: 100,
      singleEvents: true,
      orderBy: "startTime",
      timeZone,
    });
    logger.info({
      functionName: functionName.listEvents,
      statusCode: StatusCodes.OK,
      message: "Event created successfully",
      data: { event: response.data.items },
    });

    return response.data.items || [];
  } catch (error) {
    logger.error({
      functionName: functionName.listEvents,
      statusCode: StatusCodes.INTERNAL_SERVER_ERROR,
      message: "Error listing events",
      data: { error: error instanceof Error ? error.message : "Unknown error" },
    });
    throw new Error("Failed to retrieve Google Calendar events");
  }
}

export async function checkUserAvailability(
  refreshToken: string,
  startTime: string,
  endTime: string
) {
  try {
    const payload: Payload = {
      type: "authorized_user",
      client_id: secretVariables.GOOGLE_CLIENT_ID,
      client_secret: secretVariables.GOOGLE_CLIENT_SECRET,
      refresh_token: refreshToken,
    };

    const auth = await authorize(payload);
    const calendar = google.calendar({ version: "v3", auth });

    const response = await calendar.freebusy.query({
      requestBody: {
        timeMin: startTime,
        timeMax: endTime,
        timeZone: "Asia/Kolkata",
        items: [{ id: "primary" }],
      },
    });

    const busy = response.data.calendars?.primary?.busy || [];
    logger.info({
      functionName: functionName.checkUserAvailability,
      statusCode: StatusCodes.OK,
      message: "User availability checked successfully",
      data: { busy },
    });
    return busy.length === 0;
  } catch (error) {
    logger.error({
      functionName: functionName.checkUserAvailability,
      statusCode: StatusCodes.INTERNAL_SERVER_ERROR,
      message: "Error checking user availability",
      data: { error: error instanceof Error ? error.message : "Unknown error" },
    });
    throw new Error("Failed to check user availability");
  }
}

export async function updateEvent(
  refreshToken: string,
  eventId: string,
  updatedEventData: calendar_v3.Schema$Event
) {
  try {
    const payload: Payload = {
      type: "authorized_user",
      client_id: secretVariables.GOOGLE_CLIENT_ID,
      client_secret: secretVariables.GOOGLE_CLIENT_SECRET,
      refresh_token: refreshToken,
    };

    const auth = await authorize(payload);
    const calendar = google.calendar({ version: "v3", auth });

    const existingEvent = await calendar.events.get({
      calendarId: "primary",
      eventId: eventId,
    });

    if (
      existingEvent.data.extendedProperties?.private?.source !== "CloudCapture"
    ) {
        logger.warn({
            functionName: functionName.updateEvent,
            statusCode: StatusCodes.FORBIDDEN,
            message: "Unauthorized to update event",
            data: {eventId},
        })
      return {
        success: false,
        message: "You can only update events created by CloudCapture",
      };
    }

    const response = await calendar.events.update(<
      calendar_v3.Params$Resource$Events$Update
    >{
      calendarId: "primary",
      eventId: eventId,
      requestBody: { ...existingEvent.data, ...updatedEventData },
      conferenceDataVersion: 1,
    });
    logger.info({
        functionName: functionName.updateEvent,
        statusCode: StatusCodes.OK,
        message: `Event ${eventId} updated successfully`,
        data: response.data,
      });
    return response.data;
  } catch (error) {
    logger.error({
        functionName: functionName.updateEvent,
        statusCode: StatusCodes.INTERNAL_SERVER_ERROR,
        message: "Error updating event",
        data: { error: error instanceof Error ? error.message : "Unknown error" },
      });
    throw new Error("Failed to update the event");
  }
}

export async function deleteEvent(refreshToken: string, eventId: string) {
  try {
    const payload: Payload = {
      type: "authorized_user",
      client_id: secretVariables.GOOGLE_CLIENT_ID,
      client_secret: secretVariables.GOOGLE_CLIENT_SECRET,
      refresh_token: refreshToken,
    };

    const auth = await authorize(payload);
    const calendar = google.calendar({ version: "v3", auth });

    const existingEvent = await calendar.events.get({
      calendarId: "primary",
      eventId: eventId,
    });

    if (
      existingEvent.data.extendedProperties?.private?.source !== "CloudCapture"
    ) {
        logger.warn({
            functionName: functionName.deleteEvent,
            statusCode: StatusCodes.FORBIDDEN,
            message: "Unauthorized event deletion attempt",
            data: { eventId },
          });
      return {
        success: false,
        message: "You can only delete events created by CloudCapture",
      };
    }

    await calendar.events.delete({
      calendarId: "primary",
      eventId: eventId,
    });
    logger.info({
        functionName: functionName.deleteEvent,
        statusCode: StatusCodes.OK,
        message: `Event ${eventId} deleted successfully`,
        data: {},
      });

    return { success: true, message: "Event deleted successfully" };
  } catch (error) {
    logger.error({
        functionName: functionName.deleteEvent,
        statusCode: StatusCodes.INTERNAL_SERVER_ERROR,
        message: "Error deleting event",
        data: { error: error instanceof Error ? error.message : "Unknown error" },
      });
    
    throw new Error("Failed to delete the event");
  }
}
