FROM node:22-alpine

WORKDIR /app

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
