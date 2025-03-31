
export const ERROR_MESSAGES = {
  UNAUTHORIZED: "You are not authorized to access this resource.",
  NETWORK_ERROR: "Network error. Please try again later.",
  VALIDATION: {
    REQUIRED: "This field is required.",
    INVALID_EMAIL: "Please enter a valid email address.",
  },
  MEETINGS: {
    FETCH_FAILED: "Failed to fetch meetings. Please try again.",
    CREATE_FAILED: "Failed to create the meeting. Please try again.",
    UPDATE_FAILED: "Failed to update the meeting. Please try again.",
    DELETE_FAILED: "Failed to delete the meeting. Please try again.",
  },
  AUTH: {
    LOGOUT_FAILED: "Logout failed. Please try again.",
    LOGIN_FAILED: "Login failed. Please check your credentials.",
    UNAUTHORIZED: "You are not authorized to perform this action.",
  },
  GENERAL: {
    UNKNOWN_ERROR: "An unknown error occurred. Please try again.",
    FORBIDDEN: "You do not have permission to access this resource.",
  },
  FILE_UPLOAD: {
    UPLOAD_FAILED: "File upload failed. Please try again.",
    FILE_NOT_FOUND: "File not found.",
  },
  ROLE: {
    CREATE_FAILED: "Failed to create the role. Please try again.",
    ADD_FAILED: "Failed to add a new role. Please try again.",
    FETCH_FAILED: "Failed to fetch roles. Please try again.",
    UPDATE_FAILED: "Failed to update the role. Please try again.",
    DELETE_FAILED: "Failed to delete the role. Please try again.",
  },
  DRIVE: {
    FOLDER_FETCH_FAILED: "Failed to fetch folders. Please try again.",
    FILE_FETCH_FAILED: "Failed to fetch files. Please try again.",
    NO_FILES: "No files found in this folder.",
    FILE_DELETE_FAILED: "Failed to delete the file. Please try again.",
    FILE_TRANSFER_FAILED: "Failed to transfer the file. Please try again.",
  },
  TRANSFER: {
    GCP_TRANSFER_FAILED: "Failed to transfer folder to GCP. Please try again.",
  },
  USER: {
    FETCH_FAILED: "Failed to fetch users. Please try again.",
    EDIT_ROLE_FAILED: "Failed to edit the user's role. Please try again.",
    CREATE_FAILED: "Failed to Add the user. Please try again.",
    UPDATE_FAILED: "Failed to update the user. Please try again.",
    DELETE_FAILED: "Failed to delete the user. Please try again.",
  },
  NOTIFICATIONS: {
    SEND_FAILED: "Failed to Send notifications. Please try again later.",
    MARK_AS_READ_FAILED: "Failed to mark notifications as read.",
  },
};

export const SUCCESS_MESSAGES = {
  AUTH: {
    LOGIN_SUCCESS: "You have successfully logged in.",
    LOGOUT_SUCCESS: "You have successfully logged out.",
  },
  MEETINGS: {
    CREATE_SUCCESS: "Meeting created successfully.",
    UPDATE_SUCCESS: "Meeting updated successfully.",
    DELETE_SUCCESS: "Meeting deleted successfully.",
  },
  GENERAL: {
    OPERATION_SUCCESS: "Operation completed successfully.",
  },
  FILE_UPLOAD: {
    UPLOAD_SUCCESS: "File uploaded successfully.",
  },
  ROLE: {
    CREATE_SUCCESS: "Role created successfully.",
    ADD_SUCCESS: "Role added successfully.",
    UPDATE_SUCCESS: "Role updated successfully.",
    DELETE_SUCCESS: "Role deleted successfully.",
  },
  DRIVE: {
    FOLDER_FETCH_SUCCESS: "Folders fetched successfully.",
    FILE_DELETE_SUCCESS: "File deleted successfully.",
    FILE_TRANSFER_SUCCESS: "File transferred successfully.",
  },
  TRANSFER: {
    GCP_TRANSFER_SUCCESS: "Folder transferred to GCP successfully.",
  },
  USER: {
    FETCH_SUCCESS: "Users fetched successfully.",
    EDIT_ROLE_SUCCESS: "User role updated successfully.",
    CREATE_SUCCESS: "User Added successfully.",
    UPDATE_SUCCESS: "User updated successfully.",
    DELETE_SUCCESS: "User deleted successfully.",
  },
  NOTIFICATIONS: {
    SEND_SUCCESS: "Notifications Send successfully.",
    MARK_AS_READ_SUCCESS: "Notifications marked as read.",
  },
};
