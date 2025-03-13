import React from "react";
import { Link } from "react-router-dom";
import { Calendar, Link as LinkIcon } from "lucide-react";
import { Button } from "../../ui/button"; // Importing shadcn button

interface Event {
  id: string;
  title: string;
  startTime: { dateTime: string };
  meetLink: string;
}

const EventCard: React.FC<{ event: Event }> = ({ event }) => {
  const eventDate = new Date(event.startTime.dateTime).toDateString();

  return (
    <div className="border p-4 rounded-md shadow-sm bg-white flex justify-between items-center h-24">
      {/* Left Section */}
      <div className="flex flex-col justify-center max-w-[70%]">
        <h3 className="text-lg font-semibold text-gray-900 truncate">{event.title}</h3>
        <p className="text-gray-500 flex items-center">
          <Calendar className="mr-2 text-gray-400" size={18} />
          {eventDate}
        </p>
      </div>

      {/* Join Button */}
      <Button asChild variant="default" className="flex-shrink-0 h-10">
        <Link to={event.meetLink} target="_blank" rel="noopener noreferrer" className="flex items-center">
          <LinkIcon className="mr-2" size={16} /> Join
        </Link>
      </Button>
    </div>
  );
};

export default EventCard;
