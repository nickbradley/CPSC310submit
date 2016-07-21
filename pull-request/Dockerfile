FROM node:6.3.0
RUN mkdir /app
RUN mkdir /app/logs

ADD package.json /app
ADD cpsc310-2016Fall.crt /app
ADD cpsc310-2016Fall.key /app

WORKDIR /app
RUN npm install

ADD server.js /app

CMD ["node", "server.js"]
