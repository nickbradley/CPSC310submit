FROM node:6.3.0


# Install docker (we need the client tools to run the test container)
RUN echo "deb http://ftp.debian.org/debian jessie-backports main" >> /etc/apt/sources.list
RUN apt-get update
RUN apt-get -t jessie-backports install "docker.io" -y

RUN mkdir /app
ADD package.json /app
RUN npm install

ADD jobRunner.js /app
ADD execTest.sh /app
RUN chmod a+x /app/execTest.sh

WORKDIR /app


CMD ["node", "jobRunner.js"]
