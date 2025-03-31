import { CalendarCheck, CalendarPlus } from "lucide-react";
import { Button } from "../../../ui/button";
import { useMeetings } from "../../../../context/meetingContext";
import { isToday } from "date-fns";
import { useNavigate } from "react-router-dom";


const MeetingActions: React.FC = () => {
  const { allMeetings } = useMeetings();
  const navigate = useNavigate();

  
  const todayMeetingsCount = allMeetings?.filter((meeting) =>
    isToday(new Date(meeting.startTime.dateTime))
  ).length;

  return (
    <div
      className="flex flex-col items-center p-6 rounded-lg shadow-md bg-cover bg-center text-white"
      
    >
     
      <div className="flex flex-col items-center bg-black/60 px-6 py-4 rounded-lg shadow-md">
        <CalendarCheck className="mb-2 text-green-400" size={28} />
        <span className="text-xl font-bold">{todayMeetingsCount} Meetings Today</span>
      </div>

      
      <Button onClick={()=> navigate("/dashboard/create")} variant="default" className="mt-4 w-full">
        <CalendarPlus className="mr-2" size={20} />
        Create Meeting
      </Button>
    </div>
  );
};

export default MeetingActions;
