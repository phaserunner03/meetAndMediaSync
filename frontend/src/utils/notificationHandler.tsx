import axiosInstance from "./axiosConfig";

export async function handleNotification(name:string, email:string){
    try{
        const response = await axiosInstance.post("/api/auth/notify",{name,email})
        return { success: true, message: response.data.message || "Notification sent successfully." };
    }
    catch(error:any){
        console.error("Error sending notification:", error);
        return { success: false, message: error.response?.data?.message || "Failed to send notification" };
    }

}