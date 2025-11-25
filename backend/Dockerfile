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

# Build TypeScript
RUN pnpm run build

# Production stage
FROM node:20-alpine AS runner

WORKDIR /app

# Install pnpm
RUN corepack enable && corepack prepare pnpm@latest --activate

# Copy package files and install ALL deps (need drizzle-kit for migrations)
COPY package.json pnpm-lock.yaml ./
RUN pnpm install --frozen-lockfile

# Copy built files from builder
COPY --from=builder /app/dist ./dist

# Copy drizzle config and schema for migrations
COPY --from=builder /app/drizzle.config.ts ./
COPY --from=builder /app/src/db ./src/db

# Copy seed files (source needed for tsx)
COPY --from=builder /app/src/seeds ./src/seeds
COPY --from=builder /app/src/const ./src/const

# Set environment
ENV NODE_ENV=production
ENV PORT=3000

EXPOSE 3000

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD wget --no-verbose --tries=1 --spider http://localhost:3000/trpc/articles.list || exit 1

# Run migrations, seed, then start the app
CMD ["sh", "-c", "npx drizzle-kit push && npx tsx src/seeds/seed.ts && node dist/index.js"]
