import { House } from "lucide-react";
import EventTabs from "./EventTab";
import MeetingActions from "./MeetingActions"; 

const DashboardHome: React.FC = () => {
  return (
    <div className="pt-4 sm:ml-64">
      <div className="pt-4 max-w-[1200px] mx-auto">
        
        <div className="flex items-center mb-4">
          <House className="mr-2" />
          <h2 className="text-2xl font-semibold">Home</h2>
        </div>

        <div className="flex  justify-between gap-4">
          
          <div className="flex-1 min-w-[300px]">
            <EventTabs />
          </div>
          <div className="flex-shrink-0">
            <MeetingActions />
          </div>
        </div>
      </div>
    </div>
  );
};

export default DashboardHome;
