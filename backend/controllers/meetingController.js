const meetingService = require('../services/meetingService');
const jwt = require('jsonwebtoken');
const User = require('../models/User');


const scheduleMeeting = async (req, res) => {
//   try {
//     const { accessToken, eventData } = req.body; // Get token from frontend
//     if (!accessToken) {
//         return res.status(401).json({ message: 'Unauthorized: No access token provided' });
//     }

//     const event = await createEvent(accessToken, eventData);
//     res.status(200).json(event);
// } catch (error) {
//     res.status(500).json({ message: error.message });
// }
try{
  const {user} = req;
  const {title,location,description,participants,startTime,endTime} = req.body;
  const event = await meetingService.scheduleMeeting(user, title, location,description, participants, startTime, endTime);
  res.status(200).json(event);
}
catch(err){
  res.status(500).json({message:err.message});
}
}

const getAllMeetings = async (req, res) => {
  try {
    const { year, month } = req.query;

        if (!year || !month) {
            return res.status(400).json({ success: false, message: "Year and month are required" });
        }
    const result = await meetingService.getAllMeetings(req.user,parseInt(year), parseInt(month));
    res.status(200).json(result);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
const test = async (req,res)=>{
  try{
    const token = req.header('authToken');
    const decoded = jwt.verify(token, process.env.SECRET_KEY);
    const user = await User.findOne({googleId:decoded.uid});
    console.log(user)
    res.status(200).json({message:"Token verified"});
  }
  catch(err){

  }
}

module.exports = { scheduleMeeting, getAllMeetings,test};
