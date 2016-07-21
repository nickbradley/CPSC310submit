FROM node:6.3.0
RUN mkdir /app

ADD jobRunner.js /app
ADD package.json /app
ADD execTest.sh /app

WORKDIR /app
RUN npm install

CMD ["node", "jobRunner.js"]
