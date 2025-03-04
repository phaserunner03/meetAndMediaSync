import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "../../ui/card";

interface Meeting {
  startTime: any;
  _id: string;
  title: string;
  dateTime: Date;
  meetLink: string;
}

interface MeetingCardViewProps {
  meetings?: Meeting[]; // Make meetings optional
}

const MeetingCardView: React.FC<MeetingCardViewProps> = ({ meetings = [] }) => { // Default to an empty array
  return (

    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {meetings.length === 0 ? (
        <div className="col-span-full text-center text-gray-500">
          No meetings found.
        </div>
      ) : (
        meetings.map((meeting) => (
          <Card key={meeting._id}>
            <CardHeader>
              <CardTitle>{meeting.title}</CardTitle>
            </CardHeader>
            <CardContent>
              <p><strong>Time:</strong> {new Date(meeting.startTime.dateTime).toLocaleString()}</p>
              {/* <p><strong>Participants:</strong> {meeting.participants.join(", ")}</p> */}
              <a href={meeting.meetLink} target="_blank" rel="noopener noreferrer" className="text-blue-500">Join Meeting</a>
            </CardContent>
          </Card>
        ))
      )}
    </div>
  );
};

export default MeetingCardView;