import * as yup from "yup";

const SchemaErrorMessages = {
  IS_REQUIRED: "This field is required",
  INVALID_PERMISSION: "Invalid permission",
};

export const addRoleRequest = yup.object().shape({
  name: yup.string().required(SchemaErrorMessages.IS_REQUIRED),
  permissions: yup
    .array()
    .of(yup.string().required(SchemaErrorMessages.IS_REQUIRED))
    .required(SchemaErrorMessages.IS_REQUIRED),
});

export const editRoleRequest = yup.object().shape({
    name:yup.string().required(SchemaErrorMessages.IS_REQUIRED),
    permissions:yup.array().of(yup.string().required(SchemaErrorMessages.IS_REQUIRED)).required(SchemaErrorMessages.IS_REQUIRED)
});


export type AddRoleRequest = yup.InferType<typeof addRoleRequest>;
export type EditRoleRequest = yup.InferType<typeof editRoleRequest>;