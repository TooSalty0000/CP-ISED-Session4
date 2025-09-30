FROM node:18-alpine

WORKDIR /app

COPY package.json .

RUN npm install

COPY server.js .

EXPOSE 13490

ENV PORT=13490

CMD ["node", "server.js"]
