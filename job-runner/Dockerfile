FROM node:6.3.0
RUN mkdir /app
USER root
ADD jobRunner.js /app
ADD package.json /app
ADD execTest.sh /app
RUN chmod a+x /app/execTest.sh

WORKDIR /app
RUN npm install

CMD ["node", "jobRunner.js"]
