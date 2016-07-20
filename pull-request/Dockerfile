FROM node:6.3.0
RUN mkdir /app

ADD server.js /app

WORKDIR /app
RUN npm install

CMD ["node", "server.js"]
