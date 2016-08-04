# CPSC 310 Automated Testing Service for GitHub
This testing service consumes pull request webhooks for configured repositories on GitHub. Upon receiving a request, the service will clone the repository, run the tests and publish the results as a comment on the pull request.


## Configuring the Webhook
For each repository
1. Go to **Settings**, **Webhooks & services**
2. Click **Add webhook**
3. Configure the webhook:
  1. In the _Payload URL_ field, enter <hostname>/cpsc310/test-service
  2. Click **Disable SSL verification**
  3. Under Which events would you like to trigger this webhook?, select _Let me select individual events._ and choose only _Pull request_.




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


# Set docker to start automatically

cd ~
git clone cpsc310server

# Make sym links to certs in main directory
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
     curl -u jan:apple -X PUT http://localhost:5984/cpsc310/nickbradley%2FTest -d '{}'













# Database
## Sturcture
_id: <user_name>_<repo_name>
abbrv_results:[]
last_run: <date>
num_runs: int
results: []


curl -k -X PUT 'https://192.168.0.57/cpsc310/admin/cpsc310/nickbradley_Test' -H 'content-type:application/json' -d '{"last_run":null}'
