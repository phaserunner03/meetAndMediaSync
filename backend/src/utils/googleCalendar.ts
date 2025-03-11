import { google, calendar_v3 } from 'googleapis';

interface Payload {
    type: string;
    client_id: string;
    client_secret: string;
    refresh_token: string;
}

async function authorize(payload: Payload) {
    const { client_id, client_secret, refresh_token } = payload;
    const client = new google.auth.OAuth2(client_id, client_secret);
    client.setCredentials({ refresh_token });
    return client;
}

export async function createEvent(refreshToken: string, eventData: calendar_v3.Schema$Event) {
    const payload: Payload = {
        type: 'authorized_user',
        client_id: process.env.GOOGLE_CLIENT_ID!,
        client_secret: process.env.GOOGLE_CLIENT_SECRET!,
        refresh_token: refreshToken,
    };

    const auth = await authorize(payload);
    const calendar = google.calendar({ version: 'v3', auth });

    const response = await calendar.events.insert(<calendar_v3.Params$Resource$Events$Insert>{
        calendarId: 'primary',
        resource: eventData,
        conferenceDataVersion: 1,
        sendNotifications: true,
    });

    return response.data;
}

export async function listEvents(refreshToken: string, year: number, month: number) {
    try {
        const payload: Payload = {
            type: 'authorized_user',
            client_id: process.env.GOOGLE_CLIENT_ID!,
            client_secret: process.env.GOOGLE_CLIENT_SECRET!,
            refresh_token: refreshToken,
        };

        const auth = await authorize(payload);
        const calendar = google.calendar({ version: 'v3', auth });

        const timeZone = 'Asia/Kolkata';
        const timeMin = new Date(Date.UTC(year, month - 1, 1, 0, 0, 0));
        timeMin.setMinutes(timeMin.getMinutes() + 330);

        const timeMax = new Date(Date.UTC(year, month, 1, 0, 0, 0));
        timeMax.setMinutes(timeMax.getMinutes() + 330);

        const res = await calendar.events.list({
            calendarId: 'primary',
            timeMin: timeMin.toISOString(),
            timeMax: timeMax.toISOString(),
            maxResults: 100,
            singleEvents: true,
            orderBy: 'startTime',
            timeZone,
        });

        return res.data.items || [];
    } catch (error) {
        console.error('Error fetching events:', error);
        throw new Error('Failed to retrieve Google Calendar events');
    }
}

export async function checkUserAvailability(refreshToken: string, startTime: string, endTime: string) {
    const payload: Payload = {
        type: 'authorized_user',
        client_id: process.env.GOOGLE_CLIENT_ID!,
        client_secret: process.env.GOOGLE_CLIENT_SECRET!,
        refresh_token: refreshToken,
    };

    const auth = await authorize(payload);
    const calendar = google.calendar({ version: 'v3', auth });

    const response = await calendar.freebusy.query({
        requestBody: {
            timeMin: startTime,
            timeMax: endTime,
            timeZone: 'Asia/Kolkata',
            items: [{ id: 'primary' }],
        },
    });

    const busy = response.data.calendars?.primary?.busy || [];
    return busy.length === 0;
}

export async function updateEvent(refreshToken: string, eventId: string, updatedEventData: calendar_v3.Schema$Event) {
    try {
        const payload: Payload = {
            type: 'authorized_user',
            client_id: process.env.GOOGLE_CLIENT_ID!,
            client_secret: process.env.GOOGLE_CLIENT_SECRET!,
            refresh_token: refreshToken,
        };

        const auth = await authorize(payload);
        const calendar = google.calendar({ version: 'v3', auth });

        const existingEvent = await calendar.events.get({
            calendarId: "primary",
            eventId: eventId,
        });

        if (existingEvent.data.extendedProperties?.private?.source !== "CloudCapture") {
            return { success: false, message: "You can only update events created by CloudCapture" };
        }

        const response = await calendar.events.update(<calendar_v3.Params$Resource$Events$Update>{
            calendarId: "primary",
            eventId: eventId,
            requestBody: { ...existingEvent.data, ...updatedEventData },
            conferenceDataVersion: 1,
        });

        return response.data;
    } catch (error) {
        console.error("Error updating event:", error);
        throw new Error("Failed to update the event");
    }
}

export async function deleteEvent(refreshToken: string, eventId: string) {
    try {
        const payload: Payload = {
            type: 'authorized_user',
            client_id: process.env.GOOGLE_CLIENT_ID!,
            client_secret: process.env.GOOGLE_CLIENT_SECRET!,
            refresh_token: refreshToken,
        };

        const auth = await authorize(payload);
        const calendar = google.calendar({ version: 'v3', auth });

        const existingEvent = await calendar.events.get({
            calendarId: "primary",
            eventId: eventId,
        });

        if (existingEvent.data.extendedProperties?.private?.source !== "CloudCapture") {
            return { success: false, message: "You can only delete events created by CloudCapture" };
        }

        await calendar.events.delete({
            calendarId: "primary",
            eventId: eventId,
        });

        return { success: true, message: "Event deleted successfully" };
    } catch (error) {
        console.error("Error deleting event:", error);
        throw new Error("Failed to delete the event");
    }
}
