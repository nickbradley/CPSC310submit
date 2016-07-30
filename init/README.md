# Initial Setup
The CPSC 310 automated testing service for GitHub consumes the pull request webhook.
## Install Operating System
CentOS 7 is used to as the server's OS. Download the [minimal ISO image](http://isoredirect.centos.org/centos/7/isos/x86_64/CentOS-7-x86_64-Minimal-1511.iso) and install in a virtual machine or on bare metal. During the install make sure networking is configured and add the user _cpsc310admin_ as a administrator.

## Configure OS
The testing service is a collection of Docker containers that are orchestrated using Docker Compose.
```bash
sudo yum install git -y
sudo yum install docker -y
sudo yum install docker-compose -y


cd ~
git clone cpsc310server

cp certs ~/cpsc310server/pull-request


db.env
web.env


```

## Configure Testing Service
Create named Docker data volumes to hold persistent data and to share data between Docker containers.

```bash
# Create a persistent data volume to hold database files
sudo docker volume create --name cpsc310-couchdb-store
```

## Configure CouchDB
Start the CouchDB container so that it can be configured.
```bash
sudo docker run -v cpsc310-couchdb-store:/usr/local/var/lib/couchdb couchdb:1.6.1
```

Create admin user.

```bash
DB_ADMIN_USER=cpsc310dbadmin
DB_ADMIN_PASSWORD=

curl -X PUT http://127.0.0.1:5984/_config/admins/${DB_ADMIN_USER} -d '"${DB_ADMIN_PASSWORD}"'
```

Create regular user

```bash
DB_USER=cpsc310user

```


curl -X PUT http://localhost:5984/_users/org.couchdb.user:jan \
     -H "Accept: application/json" \
     -H "Content-Type: application/json" \
     -d '{"name": "jan", "password": "apple", "roles": [], "type": "user"}'






curl -X PUT http://localhost:5984/cpsc310/_security \
     -u test:test \
     -H "Content-Type: application/json" \
     -d '{"admins": { "names": [], "roles": [] }, "members": { "names": ["jan"], "roles": [] } }'


     curl http://localhost:5984/cpsc310/


     curl -u jan:apple http://localhost:5984/cpsc310/
