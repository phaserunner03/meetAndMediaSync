import React, { useState } from "react";
import EventCard from "./EventCard";
import { useMeetings } from "../../../../context/meetingContext";
import { isToday, isTomorrow, isYesterday, isAfter, isBefore } from "date-fns";
import { Button } from "../../../ui/button"; // shadcn button

const EventTabs: React.FC = () => {
  const { allMeetings, ourMeetings } = useMeetings();
  const [activeTab, setActiveTab] = useState("today");
  const [showAllFuture, setShowAllFuture] = useState(false);
  const [showAllPast, setShowAllPast] = useState(false);

  const today = new Date();

  // Count meetings for each category
  const todayCount = allMeetings.filter(m => isToday(new Date(m.startTime.dateTime))).length;
  const futureCount = allMeetings.filter(m => isAfter(new Date(m.startTime.dateTime), today)).length;
  const pastCount = allMeetings.filter(m => isBefore(new Date(m.startTime.dateTime), today)).length;
  const ourMeetingsCount = ourMeetings.length;
  const allMeetingsCount = allMeetings.length;

  // Filtered Meetings based on active tab
  const filteredMeetings = allMeetings.filter((meeting) => {
    const meetingDate = new Date(meeting.startTime.dateTime);
    if (activeTab === "today") return isToday(meetingDate);
    if (activeTab === "future") return showAllFuture ? isAfter(meetingDate, today) : isTomorrow(meetingDate);
    if (activeTab === "past") return showAllPast ? isBefore(meetingDate, today) : isYesterday(meetingDate);
    if (activeTab === "myMeetings") return ourMeetings.some((m) => m.id === meeting.id);
    return true;
  });

  return (
    <div className="w-full max-w-4xl mx-auto">
      {/* Tabs */}
      <div className="flex space-x-4 border-b pb-2">
        {[
          { key: "today", label: "Today", count: todayCount },
          { key: "future", label: "Future", count: futureCount },
          { key: "past", label: "Past", count: pastCount },
          { key: "myMeetings", label: "My Meetings", count: ourMeetingsCount },
          { key: "allMeetings", label: "All Meetings", count: allMeetingsCount }
        ].map(({ key, label, count }) => (
          <button
            key={key}
            onClick={() => setActiveTab(key)}
            className={`px-4 py-2 text-lg flex items-center gap-2 transition-colors duration-200 ${
              activeTab === key ? "border-b-2 border-blue-600 font-semibold text-blue-600" : "text-gray-500 hover:text-blue-600"
            }`}
          >
            {label} <span className="text-sm bg-gray-200 px-2 py-0.5 rounded-full">{count}</span>
          </button>
        ))}
      </div>

      {/* Event List */}
      <div className="mt-6 space-y-4">
        {filteredMeetings.length > 0 ? (
          filteredMeetings.map((meeting) => <EventCard key={meeting.id} event={meeting} />)
        ) : (
          <p className="text-gray-500 text-center">No meetings found.</p>
        )}
      </div>

      {/* "See All" & "See Less" Buttons */}
      {activeTab === "future" && (
        <div className="flex justify-center mt-4">
          {showAllFuture ? (
            <Button onClick={() => setShowAllFuture(false)} variant="outline">
              See Less Future Events
            </Button>
          ) : (
            <Button onClick={() => setShowAllFuture(true)} variant="outline">
              See All Future Events
            </Button>
          )}
        </div>
      )}

      {activeTab === "past" && (
        <div className="flex justify-center mt-4">
          {showAllPast ? (
            <Button onClick={() => setShowAllPast(false)} variant="outline">
              See Less Past Events
            </Button>
          ) : (
            <Button onClick={() => setShowAllPast(true)} variant="outline">
              See All Past Events
            </Button>
          )}
        </div>
      )}
    </div>
  );
};

export default EventTabs;
