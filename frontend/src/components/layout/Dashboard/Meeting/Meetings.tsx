import MeetingFilter from "./MeetingFilter";
import MeetingCardView from "./MeetingCardView";
import { useMeetings } from "../../../../context/meetingContext";
import Loader from "../../../common/Loader";

const Meetings = () => {
  const { filteredMeetings,isLoading } = useMeetings();

  return (
    <div className="pt-4 sm:ml-64">
      {isLoading && (
       <Loader/>
      )}
      <div className="max-w-6xl mx-auto px-4 py-6">
        <h1 className="text-2xl font-semibold text-gray-800 mb-4">📅 Your Meetings</h1>

        <MeetingFilter />
        <MeetingCardView meetings={filteredMeetings} />
      </div>
    </div>
  );
};

export default Meetings;
