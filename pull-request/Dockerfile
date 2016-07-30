FROM node:6.3.0

# Install docker (we need the client tools to run the test container)
RUN echo "deb http://ftp.debian.org/debian jessie-backports main" >> /etc/apt/sources.list
RUN apt-get update
RUN apt-get -t jessie-backports install "docker.io" -y




RUN mkdir /app
RUN mkdir /app/logs

ADD package.json /app
ADD ../cpsc310-2016Fall.crt /app
ADD ../cpsc310-2016Fall.key /app

WORKDIR /app
RUN npm install

ADD server.js /app
ADD execTest.sh /app
RUN chmod a+x /app/execTest.sh



CMD ["node", "server.js"]
