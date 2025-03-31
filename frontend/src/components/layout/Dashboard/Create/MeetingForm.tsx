import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Input } from "../../../ui/input";
import { Button } from "../../../ui/button";
import { Textarea } from "../../../ui/textarea";
import { toast } from "sonner";
import { useMeetings } from "../../../../context/meetingContext";
import { Loader2 } from "lucide-react";
import { ERROR_MESSAGES, SUCCESS_MESSAGES } from "../../../../constants";

// Validation Schema
const meetingSchema = z.object({
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

const MeetingForm = () => {
  const { createMeeting, isLoading } = useMeetings();
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(meetingSchema),
  });

  const onSubmit = async (data: any) => {
    const meetingData = {
      title: data.title,
      description: data.description,
      location: data.location,
      participants: data.participants.split(",").map((email: string) => email.trim()),
      startTime: new Date(data.startTime).toISOString(),
      endTime: new Date(data.endTime).toISOString(),
    };
    console.log(meetingData)
    try {
      const result = await createMeeting(meetingData);

      if (result.data.success) {
        toast.success(result.data.message || SUCCESS_MESSAGES.MEETINGS.CREATE_SUCCESS);
      } else {
        
        toast.error(result.data.message|| ERROR_MESSAGES.MEETINGS.CREATE_FAILED);
      }
    } catch (error: any) {
      toast.error(error.message || ERROR_MESSAGES.NETWORK_ERROR);
    }
  };

  return (
    <div className="max-w-lg mx-auto p-6 bg-white rounded-lg shadow-md">
      <h2 className="text-xl font-bold mb-4">Schedule a Meeting</h2>
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <Input {...register("title")} placeholder="Meeting Title" />
        {errors.title && <p className="text-red-500">{errors.title.message}</p>}

        <Textarea {...register("description")} placeholder="Meeting Description" />

        <Input {...register("location")} placeholder="Location" />
        {errors.location && <p className="text-red-500">{errors.location.message}</p>}

        <Input {...register("participants")} placeholder="Enter participant emails (comma-separated)" />
        {errors.participants && <p className="text-red-500">{errors.participants.message}</p>}

        <Input {...register("startTime")} type="datetime-local" />
        {errors.startTime && <p className="text-red-500">{errors.startTime.message}</p>}

        <Input {...register("endTime")} type="datetime-local" />
        {errors.endTime && <p className="text-red-500">{errors.endTime.message}</p>}

        <Button type="submit" disabled={isLoading} className="w-full flex justify-center">
          {isLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : "Schedule Meeting"}
        </Button>
      </form>
    </div>
  );
};

export default MeetingForm;
