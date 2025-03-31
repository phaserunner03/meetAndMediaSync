import { API_ENDPOINTS, SUCCESS_MESSAGES, ERROR_MESSAGES } from "../constants";
import axiosInstance from "./axiosConfig";

export async function handleNotification(name:string, email:string){
    try{
        const response = await axiosInstance.post(API_ENDPOINTS.USER.NOTIFY,{name,email})
        return { success: true, message: response.data.message || SUCCESS_MESSAGES.NOTIFICATIONS.SEND_SUCCESS };
    }
    catch(error:any){
        console.error(`${ERROR_MESSAGES.NOTIFICATIONS.SEND_FAILED}`, error);
        return { success: false, message: error.response?.data?.message || ERROR_MESSAGES.NOTIFICATIONS.SEND_FAILED };
    }

}