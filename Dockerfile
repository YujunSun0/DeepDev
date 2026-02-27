FROM node:20-alpine AS builder
WORKDIR /app

COPY package.json package-lock.json ./
COPY apps/api/package.json ./apps/api/
COPY packages/shared-types/package.json ./packages/shared-types/
COPY packages/prompt-templates/package.json ./packages/prompt-templates/
RUN npm ci

COPY prisma ./prisma
COPY packages/shared-types ./packages/shared-types
COPY packages/prompt-templates ./packages/prompt-templates
COPY apps/api ./apps/api
COPY tsconfig.json ./

RUN npx prisma generate --schema=prisma/schema.prisma
RUN npm run build -w packages/shared-types
RUN npm run build -w packages/prompt-templates
RUN npm run build -w apps/api

FROM node:20-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production

COPY --from=builder /app/package.json ./
COPY --from=builder /app/package-lock.json ./
COPY --from=builder /app/apps/api/package.json ./apps/api/
COPY --from=builder /app/packages/shared-types/package.json ./packages/shared-types/
COPY --from=builder /app/packages/prompt-templates/package.json ./packages/prompt-templates/
RUN npm ci --omit=dev

COPY --from=builder /app/node_modules/.prisma ./node_modules/.prisma
COPY --from=builder /app/node_modules/@prisma ./node_modules/@prisma
COPY --from=builder /app/apps/api/dist ./apps/api/dist
COPY --from=builder /app/packages/shared-types/dist ./packages/shared-types/dist
COPY --from=builder /app/packages/prompt-templates/dist ./packages/prompt-templates/dist
COPY --from=builder /app/prisma ./prisma

RUN npm install -g prisma@5

EXPOSE 4000
CMD ["sh", "-c", "prisma migrate deploy --schema=prisma/schema.prisma && node apps/api/dist/main.js"]
