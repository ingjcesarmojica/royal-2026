FROM node:20-alpine AS builder

WORKDIR /app

COPY package*.json ./
COPY apps/api/package*.json ./apps/api/
RUN npm ci

COPY . .

RUN cd apps/api && npm run build

FROM node:20-alpine

WORKDIR /app

COPY package*.json ./
COPY apps/api/package*.json ./apps/api/
RUN npm ci --only=production

COPY --from=builder /app/apps/api/dist ./apps/api/dist

WORKDIR /app/apps/api

EXPOSE 3001

CMD ["node", "dist/main"]
