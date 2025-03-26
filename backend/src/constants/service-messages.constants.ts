export const SuccessResponseMessages = {
    CREATED: (params: string) => `${params} created successfully`,
    UPDATED: (params: string) => `${params} updated successfully`,
    DELETED: (params: string) => `${params} deleted successfully`,
};

export const ErrorResponseMessages = {
    NOT_FOUND: (params: string) => `${params} not found`,
    FORBIDDEN: (params: string) => `${params} access denied`,
    BAD_REQUEST: (params: string) => `Invalid ${params} request`,
    INTERNAL_ERROR: "An internal server error occurred",
};

