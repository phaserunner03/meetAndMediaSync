import * as yup from "yup";
import logger from "../utils/logger";

const SchemaErrorMessages = {
  IS_REQUIRED: "This field is required",
  NO_EXTRA_FIELDS: "No extra fields allowed",
  INVALID_EMAIL: "Invalid email format",
  EMAIL_VERIFICATION_FAILED: "Email verification failed",
};

export const createUserRequest = yup.object().shape({
  email: yup
    .string()
    .email(SchemaErrorMessages.INVALID_EMAIL)
    .required(SchemaErrorMessages.IS_REQUIRED)
    .test(
      "email-verification",
      SchemaErrorMessages.EMAIL_VERIFICATION_FAILED,
      async (value) => {
        if (!value) return false;
        const isVerified = await verifyEmail(value);
        return isVerified;
      }
    ),

  role: yup.string().required(SchemaErrorMessages.IS_REQUIRED),
});

export const updateUserRequest = yup
  .object()
  .shape({
    email: yup
      .string()
      .email(SchemaErrorMessages.INVALID_EMAIL)
      .required(SchemaErrorMessages.IS_REQUIRED)
      .test(
        "is-verified-email",
        SchemaErrorMessages.EMAIL_VERIFICATION_FAILED,
        async (value) => {
          if (!value) return false;
          const isVerified = await verifyEmail(value);
          return isVerified;
        }
      ),
    role: yup.string().required(SchemaErrorMessages.IS_REQUIRED),
  })
  .noUnknown(true, SchemaErrorMessages.NO_EXTRA_FIELDS);

async function verifyEmail(email: string): Promise<boolean> {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    logger.warn({
      functionName: "verifyEmail",
      message: "Invalid email format",
      data: { email },
    });
    return false;
  }
  return true;
}

export type CreateUserRequest = yup.InferType<typeof createUserRequest>;
export type UpdateUserRequest = yup.InferType<typeof updateUserRequest>;