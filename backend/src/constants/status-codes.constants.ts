export enum StatusCodes {
    // Success (2xx)
    OK = 200, // Standard success
    CREATED = 201, // Resource created successfully
    ACCEPTED = 202, // Request accepted but not processed yet
    NO_CONTENT = 204, // Request processed but no content returned

    // Client Errors (4xx)
    BAD_REQUEST = 400, // Invalid request from client
    UNAUTHORIZED = 401, // User is not authenticated
    FORBIDDEN = 403, // User does not have permission
    NOT_FOUND = 404, // Resource not found
    METHOD_NOT_ALLOWED = 405, // HTTP method not allowed for this endpoint
    CONFLICT = 409, // Conflict (e.g., duplicate resource)
    PAYLOAD_TOO_LARGE = 413, // Request body too large
    UNSUPPORTED_MEDIA_TYPE = 415, // Unsupported file type
    TOO_MANY_REQUESTS = 429, // Rate limiting (Too many requests)

    // Server Errors (5xx)
    INTERNAL_SERVER_ERROR = 500, // Generic server error
    NOT_IMPLEMENTED = 501, // Not implemented on the server
    BAD_GATEWAY = 502, // Invalid response from upstream server
    SERVICE_UNAVAILABLE = 503, // Server is temporarily unavailable
    GATEWAY_TIMEOUT = 504, // Server did not receive a timely response

    // Custom API Responses (If needed)
    VALIDATION_ERROR = 422, // Used when input validation fails
    SESSION_EXPIRED = 440, // Custom: Session expired
}
