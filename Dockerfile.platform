FROM node:20-bookworm-slim AS base

# Step 1: Dependencies with build tools for node-pty and native modules
FROM base AS deps
RUN apt-get update && apt-get install -y --no-install-recommends \
    python3 make g++ openssl ca-certificates \
    && rm -rf /var/lib/apt/lists/*
WORKDIR /app

COPY package.json package-lock.json ./
RUN npm ci

# Step 2: Build the Next.js application
FROM base AS builder
RUN apt-get update && apt-get install -y --no-install-recommends \
    openssl ca-certificates \
    && rm -rf /var/lib/apt/lists/*
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .

ENV NEXT_TELEMETRY_DISABLED=1
ENV NODE_ENV=production
RUN npx prisma generate
RUN npm run build

# Step 3: Production runner
FROM base AS runner
WORKDIR /app

ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1
ENV PORT=3000
ENV HOST=0.0.0.0

RUN apt-get update && apt-get install -y --no-install-recommends \
    openssl ca-certificates \
    && rm -rf /var/lib/apt/lists/*

RUN addgroup --system --gid 1001 nodejs && \
    adduser --system --uid 1001 nextjs

# Copy runtime assets
COPY --from=builder /app/public ./public
COPY --from=builder /app/prisma ./prisma
COPY --from=builder --chown=nextjs:nodejs /app/.next ./.next
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/package.json ./package.json
COPY --from=builder /app/server.js ./server.js
COPY --from=builder /app/worker.js ./worker.js
COPY --from=builder /app/worker.ts ./worker.ts

USER nextjs

EXPOSE 3000

CMD ["node", "server.js"]
