FROM node:20-alpine
RUN apk add --no-cache openssl
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

ENV NODE_ENV=production
EXPOSE 4000
CMD ["sh", "-c", "npx prisma migrate deploy --schema=prisma/schema.prisma && node apps/api/dist/main.js"]
