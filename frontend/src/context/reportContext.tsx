import React, { createContext, useContext, useEffect, useState } from "react";
import axiosInstance from "../utils/axiosConfig";

export interface Meeting {
  id: string;
  title: string;
  description: string;
  location: string;
  meetLink: string;
  scheduledBy: {
    email:string,
    role: Record<string, any>;
  };
  meetingDetails: {
    meetingDate: string;
    meetingHistory: string;
    meetingType: string;
    participants: string[];
    startTime: Date;
    endTime: Date;
  };
  googleDriveMedia: any[];
  storageLogs: any[];
  [key: string]: any;
}

interface ReportContextType {
  meetings: Meeting[];
  loading: boolean;
  fetchMeetingsWithFilters: (filters: { code?: string,title?:string, startTime?:Date, endTime?:Date, scheduledBy?:string, roleId?:string }) => Promise<void>;
}

const ReportContext = createContext<ReportContextType>({
  meetings: [],
  loading: false,
  fetchMeetingsWithFilters: async () => {},
});

export const useReportContext = () => useContext(ReportContext);

export const ReportProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [meetings, setMeetings] = useState<Meeting[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchMeetings = async () => {
      try {
        const res = await axiosInstance(
          "/reports/v1/report"
        );
        setMeetings(res.data);
        console.log(res.data)
      } catch (error) {
        console.error("Failed to fetch meetings:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchMeetings();
  }, []);

  const fetchMeetingsWithFilters = async (filters: { code?: string }) => {
    setLoading(true);
    try {
      const response = await axiosInstance.get(
        "/reports/v1/report",
        {
          params: filters,
        }
      );
      console.log(response)
      setMeetings(response.data || []);
    } catch (error) {
      console.error("Failed to fetch filtered meetings", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <ReportContext.Provider
      value={{ meetings, fetchMeetingsWithFilters, loading }}
    >
      {children}
    </ReportContext.Provider>
  );
};
