FROM node:22-alpine

WORKDIR /app

COPY package.json package-lock.json ./
RUN npm ci --omit=dev

COPY server ./server
COPY shared ./shared

ENV NODE_ENV=production

CMD ["node", "server/index.js"]
