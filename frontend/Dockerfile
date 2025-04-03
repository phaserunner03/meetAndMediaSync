# Stage 1: Build React App
FROM node:18-alpine AS builder

# Set working directory
WORKDIR /app

# Copy package.json and install dependencies
COPY package.json package-lock.json ./
RUN npm install 

# Copy the entire project and build
COPY . .
RUN npm run build

# Stage 2: Serve with Nginx
FROM nginx:alpine

# Set the correct port for Cloud Run
ENV PORT=8080
EXPOSE 8080

# Remove default Nginx config and use a custom one
RUN rm /etc/nginx/conf.d/default.conf
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Copy the built React app from `dist/` to Nginx
COPY --from=builder /app/dist /usr/share/nginx/html

# Start Nginx
CMD ["nginx", "-g", "daemon off;"]
