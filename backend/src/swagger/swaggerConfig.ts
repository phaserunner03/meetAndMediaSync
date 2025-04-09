import swaggerJsDoc from "swagger-jsdoc";

const swaggerOptions = {
  definition: {
    openapi: "3.0.0",
    info: {
      title: "Meet and Media Sync API",
      version: "1.0.0",
      description: "API documentation for Meet and Media Sync backend",
    },
    servers: [
      {
        url: "http://localhost:8080/web", // Base URL for the API
        description: "Development server",
      },
    ],
  },
  apis: [
    "./src/routes/*.ts", // Include all route files for Swagger annotations
  ],
};

const swaggerDocs = swaggerJsDoc(swaggerOptions);

export default swaggerDocs;
