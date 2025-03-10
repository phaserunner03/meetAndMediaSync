import { useState, useEffect } from "react";
// import axios from 'axios';
import axiosInstance from "../../../utils/axiosConfig"; // Import axios instance
import Cookies from "js-cookie";
import MeetingFilter from "./MeetingFilter";
import MeetingCardView from "./MeetingCardView";
// import MeetingCalendarView from "./MeetingCalendarView";

const Meetings = () => {
  const [view, setView] = useState("card"); // Toggle between 'card' and 'calendar'
  const [meetings, setMeetings] = useState([]);
  const [month, setMonth] = useState(new Date().getMonth() + 1);
  const [year, setYear] = useState(new Date().getFullYear());

  useEffect(() => {
    fetchMeetings();
  }, [month, year]);

  const fetchMeetings = async () => {
    try {
      // const authToken = Cookies.get("token");
      // console.log(authToken);
      const res = await axiosInstance.get("http://localhost:8000/api/meetings/all", {
        params: { month, year }
      });
    
      setMeetings(res.data.allMeetings);
      
    } catch (error) {
      console.error("Error fetching meetings:", error);
    }
  };

  return (
    <div className="pt-4 sm:ml-64">
    <div className="pt-4 max-w-[1800px] mx-auto">

        <MeetingFilter view={view} setView={setView} setMonth={setMonth} setYear={setYear} />
        <MeetingCardView meetings={meetings} />
      </div>
    </div>
  );
};

export default Meetings;
