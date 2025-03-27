export const SuccessResponseMessages = {
    CREATED: (resource: string) => `${resource} created successfully`,
    UPDATED: (resource: string) => `${resource} updated successfully`,
    DELETED: (resource: string) => `${resource} deleted successfully`,
    FETCHED: (resource: string) => `${resource} fetched successfully`,
    VERIFIED: (resource:string) => `${resource} verified successfully`,
    ACTION_SUCCESS: (action: string) => `${action} completed successfully`,
    TRANSFER : (resource: string) => `${resource} transferred successfully`,
    NOTIFIED: "Admin notified successfully",
};

export const ErrorResponseMessages = {
    NOT_FOUND: (resource: string) => `${resource} not found`,
    FORBIDDEN: (resource: string) => `Access denied for ${resource}`,
    BAD_REQUEST: (reason?: string) => `Bad request${reason ? `: ${reason}` : ''}`,
    UNAUTHORIZED: (reason?:string)=> `Unauthorized${reason ? `: ${reason}` : ''}`,
    INVALID_CREDENTIALS: "Invalid credentials provided",
    INTERNAL_ERROR: "An internal server error occurred",
    TOKEN_EXPIRED: "Authentication token has expired",
    VALIDATION_ERROR: (field: string) => `Invalid input for ${field}`,
    PERMISSION_DENIED: "You do not have the required permissions",
    CREATED_FAILED: (resource: string) => `${resource} creation failed`,
    DELETION_FAILED: (resource: string) => `${resource} deletion failed`,
    UPDATED_FAILED: (resource: string) => `${resource} update failed`,
    NOTIFICATION_FAILED: "Notification failed",
    
};

export const ServerResponseMessages = {
    SERVER:"Server is up and running"
}
