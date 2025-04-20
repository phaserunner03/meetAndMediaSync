import React, { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Card, CardContent, CardHeader, CardTitle } from "../../../ui/card";
import { MoreVertical, Copy, ExternalLink} from "lucide-react";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "../../../ui/dropdown-menu";
import { useMeetings } from "../../../../context/meetingContext";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "../../../ui/dialog";
import { Button } from "../../../ui/button";
import { Input } from "../../../ui/input";
import { Textarea } from "../../../ui/textarea";
import { toast } from "sonner";
import { cn } from "../../../../lib/utils";
import { motion } from "framer-motion";
import Loader from "../../../common/Loader"
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

interface MeetingCardViewProps {
  meetings?: Meeting[];
}

const editMeetingSchema = z.object({
  title: z.string().min(3, "Title is required"),
  description: z.string().optional(),
  location: z.string().min(2, "Location is required"),
  participants: z
    .string()
    .min(1, "At least one participant is required")
    .refine(
      (val) =>
        val
          .split(",")
          .map((email) => email.trim())
          .every((email) => /\S+@\S+\.\S+/.test(email)),
      "Enter valid email(s) separated by commas"
    ),
  startTime: z.string().min(1, "Start time is required"),
  endTime: z.string().min(1, "End time is required"),
});

const MeetingCardView: React.FC<MeetingCardViewProps> = ({ meetings = [] }) => {
  const { editMeeting, deleteMeeting } = useMeetings();
  const [editMeetingData, setEditMeetingData] = useState<Meeting | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const { register, handleSubmit, reset, formState: { errors } } = useForm({
    resolver: zodResolver(editMeetingSchema),
  });

  const getMeetingStatusColor = (meeting: any) => {
    const now = new Date();
    const start = new Date(meeting.startTime.dateTime);
    const end = new Date(meeting.endTime.dateTime);

    if (now >= start && now <= end) return "bg-green-500"; 
    if (now > end) return "bg-blue-500"; 
    return "bg-purple-500";
  };

  const copyToClipboard = (meeting:any) => {
    navigator.clipboard.writeText(meeting.meetLink);
    toast.success("Meeting link copied!");
  };

  const formatDateTimeLocal = (dateString: string) => {
    const date = new Date(dateString);
    return new Date(date.getTime() - date.getTimezoneOffset() * 60000)
      .toISOString()
      .slice(0, 16);
  };

  useEffect(() => {

    if (editMeetingData) {
      reset({
        title: editMeetingData.title,
        description: editMeetingData.description || "",
        location: editMeetingData.location || "",
        participants: editMeetingData.participants.join(","),
        startTime: formatDateTimeLocal(editMeetingData.startTime.dateTime),
        endTime: formatDateTimeLocal(editMeetingData.endTime.dateTime),
      });
    }
  }, [editMeetingData, reset]);

  const onSubmit = async (data: any) => {
    if (!editMeetingData) return;

    setIsSaving(true); 
    const updatedMeetingData = {
      title: data.title,
      description: data.description,
      location: data.location,
      participants: data.participants.split(",").map((email: string) => email.trim()),
      startTime: new Date(data.startTime).toISOString(),
      endTime: new Date(data.endTime).toISOString(),
    };

    const result = await editMeeting(editMeetingData.id, updatedMeetingData);

    if (result.success) {
      toast.success(" Meeting updated successfully!");
      setEditMeetingData(null);
      reset();
    } else {
      toast.error(` Failed to update meeting: ${result.message}`);
    }
    setIsSaving(false); 
  };



  return (
    <div className="relative mt-6">
      
        <motion.div initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">



          {meetings.length === 0 ? (
            <div className="col-span-full text-center text-gray-500">No meetings found.</div>
          ) : (
            meetings.map((meeting, index) => (
              <Card key={meeting.id || index} className="relative p-4 shadow-md border border-gray-200 rounded-lg">
                <div className={`absolute top-0 left-0 w-full h-1 ${getMeetingStatusColor(meeting)}`} />
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
                      "text-gray-700",
                      meeting.description && meeting.description.length > 60 ? "truncate" : ""
                    )}
                    title={meeting.description}
                  >
                    <strong>Description:</strong> {meeting.description || "No description provided"}
                  </p>
                  <p className="text-gray-700">
                    <strong>Location:</strong> {meeting.location || "No location provided"}
                  </p>
                  <div className="flex gap-2">
                   
                    <Button variant="outline" onClick={() => copyToClipboard(meeting)}>
                      <Copy size={16} className="mr-2" />
                      Copy Link
                    </Button>

                   
                    <Button variant="default" onClick={() => window.open(meeting.meetLink, "_blank")}>
                      <ExternalLink size={16} className="mr-2" />
                      Join Meeting
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))
          )}

          {editMeetingData && (
            <Dialog open={!!editMeetingData} onOpenChange={() => setEditMeetingData(null)}>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Edit Meeting</DialogTitle>
                </DialogHeader>
                <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                  <Input {...register("title")} placeholder="Title" />
                  {errors.title && <p className="text-red-500 text-sm">{errors.title.message}</p>}

                  <Textarea {...register("description")} placeholder="Description" />

                  <Input {...register("location")} placeholder="Location" />
                  {errors.location && <p className="text-red-500 text-sm">{errors.location.message}</p>}

                  <Input {...register("participants")} placeholder="Enter participant emails (comma-separated)" />
                  {errors.participants && <p className="text-red-500 text-sm">{errors.participants.message}</p>}

                  <Input {...register("startTime")} type="datetime-local" />
                  {errors.startTime && <p className="text-red-500 text-sm">{errors.startTime.message}</p>}

                  <Input {...register("endTime")} type="datetime-local" />
                  {errors.endTime && <p className="text-red-500 text-sm">{errors.endTime.message}</p>}

                  <DialogFooter>
                    <Button variant="outline" type="button" onClick={() => setEditMeetingData(null)} disabled={isSaving}>
                      Cancel
                    </Button>
                    <Button type="submit" disabled={isSaving}>
                      {isSaving ? <Loader /> : "Save"}
                    </Button>
                  </DialogFooter>
                </form>
              </DialogContent>
            </Dialog>
          )}
        </motion.div>
    </div>
  );
};

export default MeetingCardView;
