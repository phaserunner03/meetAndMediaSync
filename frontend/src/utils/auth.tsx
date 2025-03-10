import axios from "./axiosConfig";

export const refreshToken = async () => {
  try {
    const response = await axios.post('/api/auth/refresh-token');
    return response.data.token;
  } catch (error) {
    console.error('Failed to refresh token:', error);
    throw error;
  }
};

export const isTokenExpired = (token: string) => {
  if (!token) return true;

  const decodedToken = JSON.parse(atob(token.split('.')[1]));
  const expiry = decodedToken.exp * 1000;
  return Date.now() >= expiry;
};