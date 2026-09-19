# Stage 1: Build React application
FROM node:20-alpine AS build

WORKDIR /app

# Copy package files first
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy frontend source code
COPY . .

# Build React application
RUN npm run build


# Stage 2: Serve the built application
FROM nginx:alpine

# Copy React build files to nginx
COPY --from=build /app/dist /usr/share/nginx/html

# Expose nginx port
EXPOSE 80

# Start nginx
CMD ["nginx", "-g", "daemon off;"]