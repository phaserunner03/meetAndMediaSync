import axios from "axios";
import { API_URL } from "../constants/constants";

const axiosInstance = axios.create({
    baseURL: API_URL,
    withCredentials: true, 
});

export default axiosInstance;
