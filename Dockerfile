FROM node:22-alpine

WORKDIR /app

# API-only deps — avoids frontend lockfile / optional native package drift
COPY server/package.json server/package-lock.json ./server/
RUN cd server && npm ci --omit=dev

COPY server ./server
COPY shared ./shared

ENV NODE_ENV=production

CMD ["node", "server/index.js"]
