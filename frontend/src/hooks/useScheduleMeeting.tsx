import { useState } from "react";
import axiosInstance from "../utils/axiosConfig";

export const useScheduleMeeting = () => {
  const [isLoading, setIsLoading] = useState(false);
  

  const scheduleMeeting = async (meetingData:any) => {
    setIsLoading(true);
    try {
    
      const response = await axiosInstance.post("/api/meetings/schedule", meetingData);
      
      setIsLoading(false);
      return { success: true, data: response.data };
    } catch (error: any) {
      setIsLoading(false);
      return { success: false, message: error.response?.data?.message || "Something went wrong" };
    }
  };

  return { scheduleMeeting, isLoading };
};
