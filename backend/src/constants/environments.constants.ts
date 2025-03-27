export enum Environments {
    DEVELOPMENT = "development",
    PRODUCTION = "production",
}

export const environment = {
    DATABASE_URL: process.env.DATABASE_URL ?? "",
    PORT: process.env.PORT ?? "",
    NODE_ENV: process.env.NODE_ENV ?? Environments.DEVELOPMENT,
    FRONTEND_URL: process.env.FRONTEND_URL ?? "http://localhost:5173",
};

export const secretVariables = {
    SECRET_KEY: process.env.SECRET_KEY ?? "",
    GOOGLE_CLIENT_ID: process.env.GOOGLE_CLIENT_ID ?? "",
    GOOGLE_CLIENT_SECRET: process.env.GOOGLE_CLIENT_SECRET ?? "",
    GOOGLE_REDIRECT_URI: process.env.GOOGLE_REDIRECT_URI ?? "",
    ADMIN_EMAIL: process.env.ADMIN_EMAIL ?? "",
    SMTP: {
        HOST: process.env.SMTP_HOST ?? "smtp.gmail.com",
        PORT: process.env.SMTP_PORT ?? "587",
        USER: process.env.SMTP_USER ?? "",
        PASS: process.env.SMTP_PASS ?? "",
    },
    GCP: {
        PROJECT_ID: process.env.GCP_PROJECT_ID ?? "",
        BUCKET_NAME: process.env.GCP_BUCKET_NAME ?? "",
        SERVICE_KEY_PATH: process.env.GCP_SERVICE_KEY_PATH ?? "",
    },
};
