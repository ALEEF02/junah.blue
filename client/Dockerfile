FROM node:18-alpine

# Set working directory
WORKDIR /app

# Add necessary packages for native dependencies
RUN apk add --no-cache python3 make g++ git

# Copy package files first for better caching
COPY package*.json ./

# Set npm configuration for better compatibility
RUN npm config set legacy-peer-deps true

# Install dependencies
RUN npm install --legacy-peer-deps

# Copy source code
COPY . .

# Set environment variables
ENV NODE_ENV=development
ENV CHOKIDAR_USEPOLLING=true
ENV WATCHPACK_POLLING=true
ENV WDS_SOCKET_HOST=0.0.0.0
ENV WDS_SOCKET_PORT=3000

# Expose port
EXPOSE 3000

# Start development server
CMD ["npm", "start"]