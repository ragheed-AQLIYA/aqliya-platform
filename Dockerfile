FROM node:20-alpine AS base

FROM base AS builder
WORKDIR /app
# Placeholders for postinstall (prisma generate + validate-env) during image build.
ENV DATABASE_URL=postgresql://postgres:postgres@localhost:5432/aqliya
ENV AUTH_SECRET=build-time-placeholder-minimum-32-characters
COPY package.json package-lock.json ./
RUN npm ci --ignore-scripts
COPY . .
RUN npm run build

FROM base AS runner
WORKDIR /app
ENV NODE_ENV=production
ENV LOCAL_STORAGE_DIR=/app/uploads
RUN addgroup --system --gid 1001 nodejs && \
    adduser --system --uid 1001 nextjs && \
    mkdir -p /app/uploads && \
    chown -R nextjs:nodejs /app/uploads
COPY --from=builder /app/public ./public
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static
USER nextjs
EXPOSE 3000
ENV PORT=3000
ENV HOSTNAME="0.0.0.0"
CMD ["node", "server.js"]
