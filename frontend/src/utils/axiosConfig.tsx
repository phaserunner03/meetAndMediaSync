import axios from "axios";

const axiosInstance = axios.create({
    baseURL: "https://backend-972397341408.us-central1.run.app",
    withCredentials: true, 
});

export default axiosInstance;
