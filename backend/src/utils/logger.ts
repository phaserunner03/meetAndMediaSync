// Node external module imports
import winston from 'winston';

// Node built-in module imports
import path from 'path';

const customLevels = {
    error: 0,
    warn: 1,
    info: 2,
    http: 3,
    debug: 4
};

const customColors = {
    error: 'red',
    warn: 'yellow',
    info: 'green',
    http: 'magenta',
    debug: 'blue'
};

// Apply the custom colors to Winston
winston.addColors(customColors);

// Create formats for console and file
const consoleFormat = winston.format.combine(
    winston.format.colorize({ all: true }), // Apply color to all log levels
    winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
    winston.format.printf(({ timestamp, level, functionName, statusCode, message, data }) => {
        const formattedData =
            typeof data === 'object' && data !== null ? JSON.stringify(data, null, 4) : data;
        return `{timestamp: ${timestamp}, level: [${level}], function: ${functionName || 'N/A'}, statusCode:  ${statusCode || 'No Code'},message: ${message}, data: ${formattedData}}`;
    })
);

const fileFormat = winston.format.combine(
    winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
    winston.format.printf(({ timestamp, level, functionName, statusCode, message, data }) => {
        const formattedData =
            typeof data === 'object' && data !== null ? JSON.stringify(data, null, 4) : data;
        return `{timestamp: ${timestamp}, level:[${level}], function: ${functionName || 'N/A'}, statusCode: ${statusCode || 'No Code'},message: ${message}, data: ${formattedData}}`;
    })
);

const logger = winston.createLogger({
    levels: customLevels, // Use the default npm log levels
    level: 'debug',
    transports: [
        new winston.transports.Console({
            // Log to console
            format: consoleFormat
        }),
        new winston.transports.File({
            filename: path.join('./', 'server.log'), // Path to the log file
            level: 'debug',
            format: fileFormat
        })
    ]
});

export default logger;