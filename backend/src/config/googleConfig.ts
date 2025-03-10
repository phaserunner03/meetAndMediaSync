import { google } from 'googleapis';

const SCOPES = ['https://www.googleapis.com/auth/calendar.events'];

const auth = new google.auth.GoogleAuth({
    credentials: require('./config.json'),
    scopes: SCOPES,
});

const calendar = google.calendar({ version: 'v3', auth });

export { calendar };
