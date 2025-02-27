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


// async function listEvents(auth) {
//     const calendar = google.calendar({version: 'v3', auth});
//     const res = await calendar.events.list({
//       calendarId: 'primary',
//       timeMin: new Date().toISOString(),
//       maxResults: 10,
//       singleEvents: true,
//       orderBy: 'startTime',
//     });
//     const events = res.data.items;
//     if (!events || events.length === 0) {
//       console.log('No upcoming events found.');
//       return;
//     }
//     console.log('Upcoming 10 events:');
//     events.map((event, i) => {
//       const start = event.start.dateTime || event.start.date;
//       console.log(`${start} - ${event.summary}`);
//     });
//   }

// module.exports = { createEvent };


// const createEvent = async (accessToken, event) => {
//     const calendar = google.calendar({ version: 'v3', auth: accessToken });

//     try {
//         const response = await calendar.events.insert({
//             calendarId: 'primary',
//             resource: event,
//             conferenceDataVersion: 1,
//         });

//         return response.data;
//     } catch (error) {
//         console.error('Error creating event:', error);
//         throw new Error('Failed to create Google Calendar event');
//     }
// };

module.exports = { createEvent };