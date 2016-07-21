FROM node:6.3.0
RUN mkdir /app

ADD server.js /app
ADD package.json /app
ADD cpsc310-2016Fall.crt /app
ADD cpsc310-2016Fall.key /app

WORKDIR /app
RUN npm install

EXPOSE 4430

CMD ["node", "server.js"]
