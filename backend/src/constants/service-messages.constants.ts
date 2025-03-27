export const SuccessResponseMessages = {
    CREATED: (resource: string) => `${resource} created successfully`,
    UPDATED: (resource: string) => `${resource} updated successfully`,
    DELETED: (resource: string) => `${resource} deleted successfully`,
    FETCHED: (resource: string) => `${resource} fetched successfully`,
    ACTION_SUCCESS: (action: string) => `${action} completed successfully`,
};

export const ErrorResponseMessages = {
    NOT_FOUND: (resource: string) => `${resource} not found`,
    FORBIDDEN: (resource: string) => `Access denied for ${resource}`,
    BAD_REQUEST: (reason?: string) => `Bad request${reason ? `: ${reason}` : ''}`,
    UNAUTHORIZED: "Unauthorized access",
    INVALID_CREDENTIALS: "Invalid credentials provided",
    INTERNAL_ERROR: "An internal server error occurred",
    TOKEN_EXPIRED: "Authentication token has expired",
    VALIDATION_ERROR: (field: string) => `Invalid input for ${field}`,
    PERMISSION_DENIED: "You do not have the required permissions",
};
