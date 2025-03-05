const { google } = require('googleapis');
// const admin = require('../config/firebase'); // Firebase Admin SDK

const SCOPES = ['https://www.googleapis.com/auth/calendar.events'];

const auth = new google.auth.GoogleAuth({
    credentials: require('./config.json'), // Use your Firebase service account
    scopes: SCOPES,
});

const calendar = google.calendar({ version: 'v3', auth });

module.exports = { calendar };
