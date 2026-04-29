FROM node:20-slim

WORKDIR /app

COPY package*.json ./
RUN npm ci --only=production

COPY . .

RUN mkdir -p uploads/templates uploads/temp uploads/generated data

EXPOSE 5000

CMD ["node", "server.js"]