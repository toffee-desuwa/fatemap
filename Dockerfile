# ── HF Spaces Docker deployment for FateMap (Next.js 15) ──
# HF Spaces expects port 7860 and runs containers as uid 1000.

# ── Stage 1: Build ──
FROM node:20-slim AS builder
WORKDIR /app

ENV NEXT_TELEMETRY_DISABLED=1
ENV NODE_OPTIONS="--max-old-space-size=4096"

COPY package.json package-lock.json ./
RUN npm install --frozen-lockfile || npm install

COPY . .
RUN npm run build

# ── Stage 2: Run ──
FROM node:20-slim AS runner
WORKDIR /app

ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1

# HF Spaces runs as uid 1000 (already exists in node image)
# Just use the existing 'node' user instead of creating a new one

COPY --from=builder /app/public ./public

# Set up .next directory
RUN mkdir .next && chown node:node .next

# Leverage standalone output from Next.js
COPY --from=builder --chown=node:node /app/.next/standalone ./
COPY --from=builder --chown=node:node /app/.next/static ./.next/static

USER node

# HF Spaces maps external traffic to app_port (default 7860)
EXPOSE 7860
ENV PORT=7860
ENV HOSTNAME="0.0.0.0"

CMD ["node", "server.js"]
