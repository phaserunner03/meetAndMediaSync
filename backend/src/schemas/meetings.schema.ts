import { title } from "process";
import * as yup from "yup";

const SchemaErrorMessages = {
  IS_REQUIRED: "This field is required",
  NO_EXTRA_FIELDS: "No extra fields allowed",
  INVALID_EMAIL: "Invalid email format",
  EMAIL_VERIFICATION_FAILED: "Email verification failed",
  INVALID_DATE: "Invalid date format",
  INVALID_PARTICIPANTS: "Invalid participants",
};

export const scheduleMeetingRequest = yup.object().shape({
    title: yup.string().required(SchemaErrorMessages.IS_REQUIRED),
    location: yup.string().required(SchemaErrorMessages.IS_REQUIRED),
    description: yup.string().optional(),
    participants : yup.array().of(yup.string().email(SchemaErrorMessages.INVALID_EMAIL)).required(SchemaErrorMessages.INVALID_PARTICIPANTS),
    startTime : yup.date().required(SchemaErrorMessages.INVALID_DATE),
    endTime : yup.date().min(yup.ref("startTime"),"End time must be after start time").
    required(SchemaErrorMessages.INVALID_DATE)
});

export const updateMeetingRequest = yup.object().shape({
    title: yup.string().optional(),
    location: yup.string().optional(),
    description: yup.string().optional(),
    participants : yup.array().of(yup.string().email(SchemaErrorMessages.INVALID_EMAIL)).optional(),
    startTime : yup.date().optional(),
    endTime : yup.date().min(yup.ref("startTime"),"End time must be after start time").optional()
})

export const verifyMeetingRequest = yup.object().shape({
    meetingCode : yup.string().required(SchemaErrorMessages.IS_REQUIRED),
    token: yup.string().required(SchemaErrorMessages.IS_REQUIRED)
})

export type ScheduleMeetingRequest = yup.InferType<typeof scheduleMeetingRequest>;
export type UpdateMeetingRequest = yup.InferType<typeof updateMeetingRequest>;
export type VerifyMeetingRequest = yup.InferType<typeof verifyMeetingRequest>;