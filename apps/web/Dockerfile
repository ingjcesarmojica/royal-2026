FROM node:20-alpine AS builder

WORKDIR /app

COPY package*.json ./
COPY apps/web/package*.json ./apps/web/
RUN npm ci

COPY . .

RUN cd apps/web && npm run build

FROM node:20-alpine

WORKDIR /app

COPY package*.json ./
COPY apps/web/package*.json ./apps/web/
RUN npm ci --only=production

COPY --from=builder /app/apps/web/.next ./.next
COPY --from=builder /app/apps/web/public ./public
COPY --from=builder /app/apps/web/next.config.js ./

WORKDIR /app/apps/web

EXPOSE 3000

CMD ["npm", "start"]
