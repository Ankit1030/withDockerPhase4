# Stage 1: Build the Angular application
FROM node:20-alpine as build

# Set working directory
WORKDIR /app

# Install dependencies
# COPY package.json ./
# RUN npm install -f

RUN npm install -g http-server
# Copy the rest of the application files
# COPY . .
COPY dist/browser


# Build the application
# RUN npm run build

# Stage 2: Serve the Angular application using Nginx
# FROM nginx:alpine

# Copy the build output to the Nginx html directory
# COPY --from=build /app/dist/browser /usr/share/nginx/html
# COPY  /app/dist/browser /usr/share/nginx/html

# Copy custom Nginx configuration if needed
# COPY nginx.conf /etc/nginx/nginx.conf

# Expose port 80
EXPOSE 8080

# Start Nginx
# CMD ["nginx", "-g", "daemon off;"]
CMD ["http-server", "-p", "8080"]