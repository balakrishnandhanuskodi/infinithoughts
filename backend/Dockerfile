FROM node:22-slim

WORKDIR /app

# Install build-essential and canvas dependencies
# build-essential includes make, gcc, g++, etc.
RUN apt-get update && apt-get install -y --no-install-recommends \
    build-essential python3 \
    libcairo2-dev libjpeg-dev libpango1.0-dev libgif-dev libpixman-1-dev \
    && rm -rf /var/lib/apt/lists/*

# Copy backend package files (context is already ./backend)
COPY package.json ./

# Install dependencies (use npm install since package-lock.json may not be available in backend context)
RUN npm install && npm rebuild

# Copy backend source code
COPY . .

# Build TypeScript
RUN npm run build

# Expose port
EXPOSE 3001

# Start backend server
CMD ["npm", "start"]
