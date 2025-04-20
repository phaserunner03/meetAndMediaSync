import * as yup from "yup";
const SchemaErrorMessages = {  
    IS_REQUIRED: "This field is required",
    INVALID_EMAIL: "Invalid email format",
};

export const triggerTransferRequest = yup.object().shape({
    refreshToken: yup.string().required(SchemaErrorMessages.IS_REQUIRED),
    email: yup.string().email(SchemaErrorMessages.INVALID_EMAIL).required(SchemaErrorMessages.IS_REQUIRED),
  });
  
  export type TriggerTransferRequest = yup.InferType<typeof triggerTransferRequest>;