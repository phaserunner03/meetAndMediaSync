import MeetingFilter from "./MeetingFilter";
import MeetingCardView from "./MeetingCardView";
import { useMeetings } from "../../../../context/meetingContext";

const Meetings = () => {
  const { filteredMeetings } = useMeetings();

  return (
    <div className="pt-4 sm:ml-64">
      <div className="max-w-6xl mx-auto px-4 py-6">
        <h1 className="text-2xl font-semibold text-gray-800 mb-4">📅 Your Meetings</h1>
        <MeetingFilter />
        <MeetingCardView meetings={filteredMeetings} />
      </div>
    </div>
  );
};

export default Meetings;
