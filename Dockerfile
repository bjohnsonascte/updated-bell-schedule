# Development Dockerfile for hot reloading
FROM node:18-alpine

WORKDIR /app

# Copy source code
COPY . ./app

# Install dependencies
RUN npm ci

# Expose port
EXPOSE 3000

# Start development server
CMD ["npm", "run", "dev"]
