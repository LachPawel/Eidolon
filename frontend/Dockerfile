# Build stage
FROM node:20-alpine AS builder

WORKDIR /app

# Install pnpm
RUN corepack enable && corepack prepare pnpm@latest --activate

# Copy package files
COPY package.json pnpm-lock.yaml ./

# Install dependencies
RUN pnpm install --frozen-lockfile

# Copy source code
COPY . .

# Build for production
ARG VITE_API_URL=http://localhost:3000
ENV VITE_API_URL=$VITE_API_URL

RUN pnpm run build

# Production stage - use simple static server (Railway compatible)
FROM node:20-alpine AS runner

WORKDIR /app

# Install serve globally for static file serving
RUN npm install -g serve

# Copy built assets from builder
COPY --from=builder /app/dist ./dist

# Railway uses PORT env variable
ENV PORT=3000

EXPOSE 3000

# Serve the static files (-s for SPA mode, -l for port)
CMD ["sh", "-c", "serve -s dist -l $PORT"]
