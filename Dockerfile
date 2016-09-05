FROM node:6.3.0
MAINTAINER Nick Bradley <nbrad11@cs.ubc.ca>

# Install docker (we need the client tools to run the test container)
#RUN curl -sSL https://get.docker.com/ | sed 's/lxc-docker/lxc-docker-1.8.0/' | sh

# Install docker (we need the client tools to run the test container)
RUN echo "deb http://ftp.debian.org/debian jessie-backports main" >> /etc/apt/sources.list
RUN apt-get update
RUN apt-get -t jessie-backports install "docker.io" -y

RUN groupadd -r app && useradd -r -g app app

RUN mkdir /app
WORKDIR /app


COPY package.json .
RUN npm install

COPY src/app.js .
COPY app.sh .

RUN chmod a+x app.sh

#USER app
CMD ["node", "app.js"]
