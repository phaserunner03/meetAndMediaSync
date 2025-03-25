# Use an official Node.js runtime as base image
FROM node:18-alpine

# Set the working directory inside the container
WORKDIR /app

# Copy package.json and install dependencies
COPY package*.json ./

# Install dependencies (including TypeScript)
RUN npm install

# Copy the entire project to the container
COPY . .

# Compile TypeScript files
RUN npm run build

# Expose the port your backend runs on
EXPOSE 8080

# Run the backend from the compiled dist/ folder
CMD ["npm", "run", "start"]
