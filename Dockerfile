# Stage 1: Build Frontend
FROM node:20-alpine AS frontend-builder
WORKDIR /app/frontend
COPY frontend/package*.json ./
RUN npm ci
COPY frontend/ ./
RUN npm run build

# Stage 2: Production Server
FROM node:20-alpine
WORKDIR /app

# Install backend dependencies
COPY backend/package*.json ./backend/
RUN cd backend && npm ci --only=production

# Copy backend source
COPY backend/ ./backend/

# Copy compiled frontend assets into backend public directory
COPY --from=frontend-builder /app/frontend/dist ./backend/public

EXPOSE 5000
ENV NODE_ENV=production
ENV PORT=5000

CMD ["node", "backend/server.js"]
