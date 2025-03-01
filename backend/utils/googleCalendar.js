const { google } = require('googleapis');

async function authorize(payload) {
    let client = google.auth.fromJSON(payload);
    if (client) return client;
    
}

async function createEvent(refreshToken, eventData) {
async function createEvent(refreshToken, eventData) {
    const payload = {
        type: 'authorized_user',
        client_id: process.env.GOOGLE_CLIENT_ID,
        client_secret: process.env.GOOGLE_CLIENT_SECRET,
        refresh_token: refreshToken,
      }
    
      const auth = await authorize(payload);
      const calendar = google.calendar({ version: 'v3', auth });
    


        

    const response = await calendar.events.insert({
        calendarId: 'primary',
        resource: eventData,
        conferenceDataVersion: 1,
        sendNotifications: true,
    });

}
    return response.data;
}

/**
 * List all Google Calendar events for the next year.
 */
async function listEvents(refreshToken) {
    try {
        const payload = {
            type: 'authorized_user',
            client_id: process.env.GOOGLE_CLIENT_ID,
            client_secret: process.env.GOOGLE_CLIENT_SECRET,
            refresh_token: refreshToken,
        };

        const auth = await authorize(payload);
        const calendar = google.calendar({ version: 'v3', auth });

        const now = new Date();
        const oneYearLater = new Date();
        oneYearLater.setFullYear(now.getFullYear() + 1);

        const res = await calendar.events.list({
            calendarId: 'primary',
            timeMin: now.toISOString(),
            timeMax: oneYearLater.toISOString(),
            maxResults: 2500, // Maximum allowed by Google Calendar API
            singleEvents: true,
            orderBy: 'startTime',
        });

        const events = res.data.items;
        if (!events || events.length === 0) {
            console.log('No upcoming events found.');
            return [];
        }

        console.log(`Total ${events.length} events found for the next year.`);
        return events;
    } catch (error) {
        console.error('Error fetching events:', error);
        throw new Error('Failed to retrieve Google Calendar events');
    }
}
/**
 * List all Google Calendar events for the next year.
 */
async function listEvents(refreshToken) {
    try {
        const payload = {
            type: 'authorized_user',
            client_id: process.env.GOOGLE_CLIENT_ID,
            client_secret: process.env.GOOGLE_CLIENT_SECRET,
            refresh_token: refreshToken,
        };

        const auth = await authorize(payload);
        const calendar = google.calendar({ version: 'v3', auth });

        const now = new Date();
        const oneYearLater = new Date();
        oneYearLater.setFullYear(now.getFullYear() + 1);

        const res = await calendar.events.list({
            calendarId: 'primary',
            timeMin: now.toISOString(),
            timeMax: oneYearLater.toISOString(),
            maxResults: 2500, // Maximum allowed by Google Calendar API
            singleEvents: true,
            orderBy: 'startTime',
        });

        const events = res.data.items;
        if (!events || events.length === 0) {
            console.log('No upcoming events found.');
            return [];
        }

        console.log(`Total ${events.length} events found for the next year.`);
        return events;
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
