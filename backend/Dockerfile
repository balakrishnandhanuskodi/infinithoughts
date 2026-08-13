FROM node:22-slim

WORKDIR /app

# Install build-essential and canvas dependencies
# build-essential includes make, gcc, g++, etc.
RUN apt-get update && apt-get install -y --no-install-recommends \
    build-essential python3 \
    libcairo2-dev libjpeg-dev libpango-1.0-dev libgif-dev libpixman-1-dev \
    && rm -rf /var/lib/apt/lists/*

# Copy workspace root package.json and lock file so npm understands monorepo structure
COPY package.json package-lock.json ./

# Copy backend package files
COPY backend/package.json backend/package-lock.json ./backend/

# Install dependencies with workspace context
RUN npm ci --workspace=backend

# Copy backend source code
COPY backend ./backend

# Expose port
EXPOSE 3001

# Start development server in backend directory
CMD ["npm", "run", "dev", "--workspace=backend"]
