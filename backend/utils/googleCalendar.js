const { google } = require('googleapis');

async function authorize(payload) {
    let client = google.auth.fromJSON(payload);
    if (client) return client;
}

// Create a new event
async function createEvent(refreshToken, eventData) {
    const payload = {
        type: 'authorized_user',
        client_id: process.env.GOOGLE_CLIENT_ID,
        client_secret: process.env.GOOGLE_CLIENT_SECRET,
        refresh_token: refreshToken,
    };

    const auth = await authorize(payload);
    const calendar = google.calendar({ version: 'v3', auth });

    const response = await calendar.events.insert({
        calendarId: 'primary',
        resource: eventData,
        conferenceDataVersion: 1,
        sendNotifications: true,
    });

    return response.data;
}

// List events for a given month
async function listEvents(refreshToken, year, month) {
    try {
        const payload = {
            type: 'authorized_user',
            client_id: process.env.GOOGLE_CLIENT_ID,
            client_secret: process.env.GOOGLE_CLIENT_SECRET,
            refresh_token: refreshToken,
        };

        const auth = await authorize(payload);
        const calendar = google.calendar({ version: 'v3', auth });

        const timeZone = 'Asia/Kolkata';
        const timeMin = new Date(Date.UTC(year, month - 1, 1, 0, 0, 0));
        timeMin.setMinutes(timeMin.getMinutes() + 330); // Convert UTC to IST

        const timeMax = new Date(Date.UTC(year, month, 1, 0, 0, 0));
        timeMax.setMinutes(timeMax.getMinutes() + 330); // Convert UTC to IST

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

// Check user availability
async function checkUserAvailability(refreshToken, startTime, endTime) {
    const payload = {
        type: 'authorized_user',
        client_id: process.env.GOOGLE_CLIENT_ID,
        client_secret: process.env.GOOGLE_CLIENT_SECRET,
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

    const busy = response.data.calendars.primary.busy;
    return busy.length === 0;
}

async function updateEvent(refreshToken, eventId, updatedEventData) {
    try {
        const payload = {
            type: 'authorized_user',
            client_id: process.env.GOOGLE_CLIENT_ID,
            client_secret: process.env.GOOGLE_CLIENT_SECRET,
            refresh_token: refreshToken,
        };

        const auth = await authorize(payload);
        const calendar = google.calendar({ version: 'v3', auth });

        // Fetch the event to verify it belongs to CloudCapture
        const existingEvent = await calendar.events.get({
            calendarId: "primary",
            eventId: eventId,
        });

        if (existingEvent.data.extendedProperties?.private?.source !== "CloudCapture") {
            return {success:false, message:"You can only update events created by CloudCapture"};
        }

        // Update the event with new details
        const response = await calendar.events.update({
            calendarId: "primary",
            eventId: eventId,
            resource: { ...existingEvent.data, ...updatedEventData },
            conferenceDataVersion: 1,
        });

        return response.data;
    } catch (error) {
        console.error("Error updating event:", error);
        throw new Error("Failed to update the event");
    }
}

async function deleteEvent(refreshToken, eventId) {
    try {
        const payload = {
            type: 'authorized_user',
            client_id: process.env.GOOGLE_CLIENT_ID,
            client_secret: process.env.GOOGLE_CLIENT_SECRET,
            refresh_token: refreshToken,
        };

        const auth = await authorize(payload);
        const calendar = google.calendar({ version: 'v3', auth });

        // Fetch the event to verify it belongs to CloudCapture
        const existingEvent = await calendar.events.get({
            calendarId: "primary",
            eventId: eventId,
        });

        if (existingEvent.data.extendedProperties?.private?.source !== "CloudCapture") {
            return {success:false, message:"You can only delete events created by CloudCapture"};
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

module.exports = { createEvent, checkUserAvailability, listEvents, updateEvent, deleteEvent };
