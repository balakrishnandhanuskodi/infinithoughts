FROM node:22-alpine

WORKDIR /app

# Install canvas build dependencies (required for native module compilation on Alpine)
RUN apk add --no-cache python3 make g++ cairo-dev jpeg-dev pango-dev giflib-dev pixman-dev

# Copy workspace root package.json and lock file so npm understands monorepo structure
COPY package.json package-lock.json ./

# Copy backend package files
COPY backend/package.json backend/package-lock.json ./backend/

# Install dependencies with workspace context - build canvas from source with available system deps
RUN npm ci --workspace=backend --build-from-source

# Copy backend source code
COPY backend ./backend

# Expose port
EXPOSE 3001

# Start development server in backend directory
CMD ["npm", "run", "dev", "--workspace=backend"]
