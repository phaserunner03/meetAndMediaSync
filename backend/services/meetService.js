const admin = require('./firebaseAdmin');
const User = require('../models/User');
const jwt = require('jsonwebtoken');
const SECRET_KEY = process.env.SECRET_KEY;

const {google} = require('googleapis');
const calendar = google.calendar('v3');
const fs= require("fs");
const { response } = require('express');

const SCOPES = ["https://www.googleapis.com/auth/calendar"];
const CREDENTIALS_PATH = "./credentials.json";

async function authorize() {
    const credentials = JSON.parse(fs.readFileSync(CREDENTIALS_PATH, "utf8"));
    const { client_id, client_secret, redirect_uris } = credentials.installed;

    const auth = new google.auth.OAuth2(client_id, client_secret, redirect_uris[0]);
    
    // Use a refresh token stored in environment variables
    auth.setCredentials({ refresh_token: process.env.REFRESH_TOKEN });
    
    return auth;
}


async function fetchEvents(accessToken){
    const decodedToken = await admin.auth().verifyIdToken(accessToken);
    console.log(decodedToken);
    const auth = new google.auth.OAuth2();
    auth.setCredentials({ access_token: accessToken });

    // Verify that the token is valid
    const tokenInfo = await auth.getTokenInfo(accessToken);
    if (!tokenInfo) {
        return res.status(401).json({ error: "Invalid access token" });
    }

    const calendar = google.calendar({ version: "v3", auth });
    const response = await calendar.events.list({
        calendarId: "primary",
        timeMin: new Date().toISOString(),
        maxResults: 10,
        singleEvents: true,
        orderBy: "startTime",
    });

    const events = response.data.items || [];

    return response.json({ events });
}

async function scheduleMeet(summary, startTime, endTime, attendees) {
    try {

        console.log("Meeting scheduled")
        return { summary, startTime, endTime, attendees };
    }
    catch (err) {
        console.error("Error in signup", err)
    }
}
module.exports = { scheduleMeet, fetchEvents};