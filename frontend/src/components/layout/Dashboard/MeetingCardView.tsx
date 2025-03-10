import React, { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Card, CardContent, CardHeader, CardTitle } from "../../ui/card";
import { MoreVertical, Loader2 } from "lucide-react"; 
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "../../ui/dropdown-menu";
import { useMeetings } from "../../../context/meetingContext";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "../../ui/dialog";
import { Button } from "../../ui/button";
import { Input } from "../../ui/input";
import { Textarea } from "../../ui/textarea";
import { toast } from "sonner"; 
import { cn } from "../../../lib/utils";

interface Meeting {
  id: string;
  title: string;
  description?: string;
  location: string;
  participants: string;
  startTime: { dateTime: string };
  endTime: { dateTime: string };
  meetLink: string;
  isOwner: boolean;
}

interface MeetingCardViewProps {
  meetings?: Meeting[];
}

const editMeetingSchema = z.object({
  title: z.string().min(3, "Title is required"),
  description: z.string().optional(),
});

const MeetingCardView: React.FC<MeetingCardViewProps> = ({ meetings = [] }) => {
  const { editMeeting, deleteMeeting } = useMeetings();
  const [editMeetingData, setEditMeetingData] = useState<Meeting | null>(null);
  const [loading, setLoading] = useState(true); 
  const { register, handleSubmit, reset, formState: { errors } } = useForm({
    resolver: zodResolver(editMeetingSchema),
  });

  useEffect(() => {
    setTimeout(() => setLoading(false), 1200); // 🔹 Simulating API delay
  }, []);

  // Reset form values when opening the edit modal
  useEffect(() => {
    if (editMeetingData) {
      reset({
        title: editMeetingData.title,
        description: editMeetingData.description || "",
      });
    }
  }, [editMeetingData, reset]);

  const onSubmit = async (data: any) => {
    if (!editMeetingData) return;

    console.log("Submitting form:", data);
    await editMeeting(editMeetingData.id, {
      title: data.title,
      description: data.description,
    });

    setEditMeetingData(null);
    reset();
  };

  return (
    <div className="relative mt-6">
      {loading ? (
        <div className="flex justify-center items-center h-[200px]">
          <Loader2 className="w-10 h-10 text-blue-500 animate-spin" />
        </div>
      ) : (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {meetings.length === 0 ? (
        <div className="col-span-full text-center text-gray-500">No meetings found.</div>
      ) : (
        meetings.map((meeting, index) => (
          <Card key={meeting.id || index} className="relative p-4 shadow-md border border-gray-200 rounded-lg">
            <CardHeader className="flex  flex-row justify-between items-center">
              <div className="flex-1">
                <CardTitle className="whitespace-normal">{meeting.title}</CardTitle>
              </div>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <button className="inline-flex text-gray-500 hover:text-gray-800">
                    <MoreVertical size={20} />
                  </button>
                </DropdownMenuTrigger>
                <DropdownMenuContent>
                  <DropdownMenuItem onClick={() => setEditMeetingData(meeting)}>Edit</DropdownMenuItem>
                  <DropdownMenuItem className="text-red-500" onClick={() => deleteMeeting(meeting.id)}>Delete</DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </CardHeader>

            <CardContent className="space-y-2">
              <p className="text-gray-700">
                <strong>Start:</strong> {new Date(meeting.startTime.dateTime).toLocaleString()}
              </p>
              <p className="text-gray-700">
                <strong>End:</strong> {new Date(meeting.endTime.dateTime).toLocaleString()}
              </p>
              <p className="text-gray-700 truncate">
                <strong>Participants:</strong> {meeting.participants}
              </p>
              <p
                className={cn(
                  "text-sm text-gray-600",
                  meeting.description && meeting.description.length > 60 ? "truncate" : ""
                )}
                title={meeting.description}
              >
                <strong>Description:</strong> {meeting.description || "No description provided"}
              </p>
              <a href={meeting.meetLink} target="_blank" rel="noopener noreferrer" className="text-blue-500 hover:underline">
                Join Meeting
              </a>
            </CardContent>
          </Card>
        ))
      )}

      {/* Edit Modal */}
      {editMeetingData && (
        <Dialog open={!!editMeetingData} onOpenChange={() => setEditMeetingData(null)}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Edit Meeting</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              <div>
                <Input {...register("title")} placeholder="Title" />
                {errors.title && <p className="text-red-500 text-sm">{errors.title.message}</p>}
              </div>

              <div>
                <Textarea {...register("description")} placeholder="Description" />
              </div>

              <DialogFooter>
                <Button variant="outline" type="button" onClick={() => setEditMeetingData(null)}>Cancel</Button>
                <Button type="submit">Save</Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      )}
    </div>
      )}
    </div>
  );
};

export default MeetingCardView;
