import * as yup from "yup";

const SchemaErrorMessages = {
    IS_REQUIRED: "This field is required",
    NO_EXTRA_FIELDS:"No extra fields allowed",
}

export const createUserRequest = yup.object().shape({
    username: yup.string().requ
})