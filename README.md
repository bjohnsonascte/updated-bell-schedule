# ASCTE Bell Schedule

A modern, responsive bell schedule application for Alabama School of Cyber Technology & Engineering.

## Features

- Real-time period tracking
- Dark/Light mode support
- Admin schedule override functionality
- Department schedule display
- TV-optimized large text display
- Bell notifications (5 min warning + period end)

## Docker Setup

### Quick Start (Production)
\`\`\`bash
# Build and run with Docker Compose
npm run docker:prod

# Access at http://localhost:3000
\`\`\`

### Development with Docker
\`\`\`bash
# Run development server with hot reloading
npm run docker:dev

# Access at http://localhost:3001
\`\`\`

### Manual Docker Commands
\`\`\`bash
# Build the image
docker build -t ascte-bell-schedule .

# Run the container
docker run -p 3000:3000 ascte-bell-schedule
\`\`\`

### Stop Docker Services
\`\`\`bash
npm run docker:stop
\`\`\`

## Local Development

\`\`\`bash
# Install dependencies
npm install

# Run development server
npm run dev

# Build for production
npm run build

# Start production server
npm start
\`\`\`

## Environment Variables

No environment variables are required for basic functionality. The app works out of the box.

## Deployment

The app is optimized for deployment on:
- Vercel (recommended)
- Docker containers
- Any Node.js hosting platform

## TV Display Mode

The app is optimized for TV displays with:
- Large, readable fonts
- High contrast colors
- Full-screen layout utilization
- Real-time updates
