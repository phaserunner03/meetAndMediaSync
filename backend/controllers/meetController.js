const dotenv = require('dotenv');
dotenv.config();
const meetService = require('../services/meetService');

async function fetchEvents(req, res) {
    try {
        const { accessToken } = req.body;
        const events = await meetService.fetchEvents(accessToken);
        return res.json({ events });
    } catch (err) {
        console.log(err);
    }
}

async function scheduleMeet(req, res) {
    try {
        const { summary, startTime, endTime, attendees } = req.body;
        const event = await meetService.scheduleMeet(summary, startTime, endTime, attendees);
        res.json({ success: true, event });
    } catch (err) {
        console.log(err);
    }
}

module.exports = { scheduleMeet, fetchEvents};
