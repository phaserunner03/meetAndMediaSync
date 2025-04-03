import * as yup from "yup";

const SchemaErrorMessages = {
  IS_REQUIRED: "This field is required",
  NO_EXTRA_FIELDS: "No extra fields allowed",
  INVALID_URL: "Invalid URL format",
  INVALID_TIMESTAMP: "Invalid timestamp format",
};

export const mediaLogRequest = yup.object().shape({
    meetingID: yup.string().required(SchemaErrorMessages.IS_REQUIRED),
    type: yup.string().optional(),
    fileUrl: yup.string().url(SchemaErrorMessages.INVALID_URL).required(SchemaErrorMessages.IS_REQUIRED),
    storedIn: yup.string().optional(),
    movedToGCP: yup.boolean().optional(),
    timestamp: yup.date().required(SchemaErrorMessages.INVALID_TIMESTAMP),
});


export type MediaLogRequest = yup.InferType<typeof mediaLogRequest>;