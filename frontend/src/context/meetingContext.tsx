import { createContext, useContext, useState, useEffect, useMemo } from "react";
import axiosInstance from "../utils/axiosConfig";

interface Meeting {
    id: string;
    title: string;
    description?: string;
    location: string;
    participants: string[];
    startTime: { dateTime: string };
    endTime: { dateTime: string };
    meetLink: string;
    isOwner: boolean;
}

interface MeetingContextType {
    allMeetings: Meeting[];
    ourMeetings: Meeting[];
    filteredMeetings: Meeting[];
    month: number;
    year: number;
    isLoading: boolean;
    setMonth: (month: number) => void;
    setYear: (year: number) => void;
    fetchMeetings: (month?: number, year?: number) => void;
    setSearchQuery: (query: string) => void;
    setSelectedDay: (day: string | null) => void;
    createMeeting: (meetingData: any) => Promise<{ success: boolean; data?: any; message?: string }>;
    editMeeting: (id: string, updateData: any) => Promise<{ success: boolean; message?: string }> 
    deleteMeeting: (id: string) => Promise<void>;
}

const MeetingContext = createContext<MeetingContextType | undefined>(undefined);

export const MeetingProvider = ({ children }: { children: React.ReactNode }) => {
    const [allMeetings, setAllMeetings] = useState<Meeting[]>([]);
    const [ourMeetings, setOurMeetings] = useState<Meeting[]>([]);
    const [filteredMeetings, setFilteredMeetings] = useState<Meeting[]>([]);
    const [searchQuery, setSearchQuery] = useState<string>("");
    const [selectedDay, setSelectedDay] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    
    // Month & Year states
    const [month, setMonth] = useState<number>(new Date().getMonth() + 1); 
    const [year, setYear] = useState<number>(new Date().getFullYear()); 

    const fetchMeetings = async (fetchMonth = month, fetchYear = year) => {
        setIsLoading(true);
        try {
            const res = await axiosInstance.get("/meetings/v1/all", { params: { month: fetchMonth, year: fetchYear } });
            console.log("Fetched meetings:", res.data);
            setAllMeetings(res.data.data.allMeetings);
            setOurMeetings(res.data.data.ourMeetings);
            setFilteredMeetings(res.data.data.allMeetings);
        } catch (error) {
            console.error("Error fetching meetings:", error);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchMeetings();
    }, [month, year]);

    const createMeeting = async (meetingData: any) => {
        setIsLoading(true);
        try {
            const res = await axiosInstance.post("/meetings/v1/schedule", meetingData);
            fetchMeetings(month,year); 
            return { success: true, data: res.data };
        } catch (error) {
            return { success: false, message: "Error creating meeting" };
        } finally {
            setIsLoading(false);
        }
    };

    const editMeeting = async (id: string, updatedData: any) => {
        try {
          const response = await axiosInstance.put(`/meetings/v1/update/${id}`, updatedData);
          
          if (response.data.success) {
            fetchMeetings(month, year); 
            return { success: true };
          } else {
            return { success: false, message: response.data.message || "Unknown error" };
          }
        } catch (error: any) {
          console.error("Error updating meeting:", error);
          return { success: false, message: error.response?.data?.message || error.message };
        }
      };
      

    const deleteMeeting = async (id: string) => {
        try {
            await axiosInstance.delete(`/meetings/v1/delete/${id}`);
            fetchMeetings(month,year); // Refresh meetings after deletion
        } catch (error) {
            console.error("Error deleting meeting:", error);
        }
    };

    useEffect(() => {
        let updatedMeetings = allMeetings;
        if (selectedDay) {
            updatedMeetings = updatedMeetings.filter(meeting => {
                if (!meeting.startTime?.dateTime) return false;
                const meetingDate = new Date(meeting.startTime.dateTime);
                if (isNaN(meetingDate.getTime())) return false;
                return meetingDate.toISOString().split("T")[0] === selectedDay;
            });
        }

        if (searchQuery.trim()) {
            updatedMeetings = updatedMeetings.filter(meeting =>
                meeting.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                meeting.description?.toLowerCase().includes(searchQuery.toLowerCase())
            );
        }

        setFilteredMeetings(updatedMeetings);
    }, [searchQuery, selectedDay, allMeetings]);

    const contextValue = useMemo(() => ({
        allMeetings, ourMeetings, filteredMeetings,
        month, year, isLoading,
        setMonth, setYear,
        fetchMeetings, setSearchQuery, setSelectedDay,
        createMeeting, editMeeting, deleteMeeting
    }), [allMeetings, ourMeetings, filteredMeetings, month, year, isLoading]);

    return (
        <MeetingContext.Provider value={contextValue}>
            {children}
        </MeetingContext.Provider>
    );
};

export const useMeetings = () => {
    const context = useContext(MeetingContext);
    if (!context) throw new Error("useMeetings must be used within a MeetingProvider");
    return context;
};
