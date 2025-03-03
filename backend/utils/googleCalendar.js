const { google } = require('googleapis');

async function authorize(payload) {
    let client = google.auth.fromJSON(payload);
    if (client) return client;
}

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

/**
 * List all Google Calendar events for the next year.
 */
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

        // Define the start and end of the given month in IST (Asia/Kolkata)
        const timeZone = 'Asia/Kolkata';

        const timeMin = new Date(Date.UTC(year, month - 1, 1, 0, 0, 0));
        timeMin.setMinutes(timeMin.getMinutes() + 330); // Convert UTC to IST

        const timeMax = new Date(Date.UTC(year, month, 1, 0, 0, 0));
        timeMax.setMinutes(timeMax.getMinutes() + 330); // Convert UTC to IST

        const res = await calendar.events.list({
            calendarId: 'primary',
            timeMin: timeMin.toISOString(),
            timeMax: timeMax.toISOString(),
            maxResults: 100, // Adjust if needed
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
async function checkUserAvaibility  (refreshToken, startTime, endTime)  {

    const payload = {
        type: 'authorized_user',
        client_id: process.env.GOOGLE_CLIENT_ID,
        client_secret: process.env.GOOGLE_CLIENT_SECRET,
        refresh_token: refreshToken,
      }
    
      const auth = await authorize(payload);
      const calendar = google.calendar({ version: 'v3', auth });
    
      const response = await calendar.freebusy.query({
        requestBody: {
            timeMin: startTime,
            timeMax: endTime,
            timeZone: "UTC",
            items: [{ id: "primary" }] 
        },
    }
    );
    const busy = response.data.calendars.primary.busy;
    return busy.length === 0;
}
    


module.exports = { createEvent, checkUserAvaibility,listEvents };