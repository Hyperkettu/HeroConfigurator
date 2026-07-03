FROM node:20 AS frontend-builder
WORKDIR /app/client

COPY client/package*.json ./

RUN npm ci

COPY client/ ./

WORKDIR /app/server

COPY server/ ./

WORKDIR /app/client

RUN npm run build

FROM node:20 AS backend-builder
WORKDIR /app/

COPY server/package*.json ./

RUN npm ci

COPY server/ ./server

WORKDIR /app/server

RUN npm run build

FROM node:20-alpine AS production
WORKDIR /app/server

ENV NODE_ENV=production

COPY server/package*.json ./
RUN npm ci --only=production

COPY --from=backend-builder /app/server/dist ./dist

COPY --from=frontend-builder /app/client/dist/ ./dist/public

COPY client/templates/index.html /app/server/dist/public/index.html
RUN mv /app/server/dist/public/dist/bundle.js /app/server/dist/public/bundle.js

EXPOSE 3004

CMD ["node", "/app/server/dist/heroconfigurator.js"]