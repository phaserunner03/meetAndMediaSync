import { getGoogleAuthURL, googleAuthCallback, refreshAccessToken } from "../services/authService.js";

export const googleAuth = (req, res) => {
  res.redirect(getGoogleAuthURL());
};

export const googleCallback = async (req, res) => {
  try {
    const { code } = req.query;
    const { user, jwtToken } = await googleAuthCallback(code);

    res.json({ user, jwtToken });
  } catch (error) {
    res.status(500).json({ error: "Authentication failed" });
  }
};

export const refreshToken = async (req, res) => {
  try {
    const { refreshToken } = req.body;
    const newAccessToken = await refreshAccessToken(refreshToken);
    res.json({ accessToken: newAccessToken });
  } catch (error) {
    res.status(500).json({ error: "Failed to refresh token" });
  }
};
