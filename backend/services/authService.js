import { google } from "googleapis";
import jwt from "jsonwebtoken";
import User from "../models/User.js"; // MongoDB User model
import dotenv from "dotenv";

dotenv.config();

const oauth2Client = new google.auth.OAuth2(
  process.env.GOOGLE_CLIENT_ID,
  process.env.GOOGLE_CLIENT_SECRET,
  process.env.GOOGLE_REDIRECT_URI
);

// Generate Google Auth URL
export const getGoogleAuthURL = () => {
  const scopes = ["https://www.googleapis.com/auth/calendar"];
  return oauth2Client.generateAuthUrl({
    access_type: "offline",
    scope: ["email", "profile", ...scopes],
    prompt: "consent",
  });
};

// Handle Google Callback
export const googleAuthCallback = async (code) => {
  const { tokens } = await oauth2Client.getToken(code);
  
  oauth2Client.setCredentials(tokens);
  // Get user info
  const oauth2 = google.oauth2({ version: "v2", auth: oauth2Client });
  const {data} = await oauth2.userinfo.get();
  // Check if user exists in DB
  let user = await User.findOne({ email: data.email });
  if (!user) {
    user = new User({
      name: data.name,
      email: data.email,
      picture: data.picture,
      googleId: data.id,
      accessToken: tokens.access_token,
      refreshToken: tokens.refresh_token,
    });
  } else {
    user.accessToken = tokens.access_token;
    user.refreshToken = tokens.refresh_token;
  }
  await user.save();

  // Generate JWT Token
  const jwtToken = jwt.sign({ id: user._id, email: user.email }, process.env.JWT_SECRET, { expiresIn: "1h" });
  console.log(jwtToken);
  return { user, jwtToken };
};

// Refresh Access Token
export const refreshAccessToken = async (refreshToken) => {
  oauth2Client.setCredentials({ refresh_token: refreshToken });
  const { credentials } = await oauth2Client.refreshAccessToken();
  return credentials.access_token;
};
