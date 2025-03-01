const { google } = require('googleapis');



async function authorize(payload) {
    
    let client = google.auth.fromJSON(payload);
    if (client) return client;
    
}

async function createEvent(refreshToken,eventData) {
    
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
            sendNotifications:true 
        });

        return response.data;
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
    

module.exports = { createEvent, checkUserAvaibility };