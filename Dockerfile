# Development Dockerfile (runs `next dev`)
FROM node:20-bookworm

WORKDIR /app

# copy only manifests first (better caching)
COPY package.json package-lock.json ./
RUN npm ci

# now copy the rest of the app into /app (NOT /app/app)
COPY . .

EXPOSE 3000
CMD ["npm", "run", "dev"]






# Note: This Dockerfile is for development purposes only.
