FROM node:20-alpine

WORKDIR /app

COPY package*.json ./

RUN npm install --only=production

COPY . .

RUN mkdir -p uploads/templates uploads/temp uploads/generated

EXPOSE 5000

CMD ["node", "server.js"]