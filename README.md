# CPSC 310 Automated Submission Service for GitHub
This service consumes commit comment webhooks from configured repositories on GitHub. Upon receiving a request, the service will clone the repository, run the tests and publish the results as a comment on the commit.

## Usage
### Start the service
Connect to the server using SSH at `skaha.cs.ubc.ca:22`. After logging in, `cd /app` and run
`sudo docker-compose up` to start the service.

### Configure the webhook on a GitHub repository
1. Go to **Settings**, **Webhooks & services**
2. Click **Add webhook**
3. Configure the webhook:
  1. In the _Payload URL_ field, enter `http://skaha.cs.ubc.ca:8080/submit`
  2. Under Which events would you like to trigger this webhook?, select _Let me select individual events._ and choose only _Commit comment_.

### Make a request
To make a submission, comment on the commit that should be tested. Include @CPSC310Bot in the comment text.



## Administration
### Environment Variables
### Messages and Logging
#### Service responses
<table>
  <tr>
    <th>Comment</th>
    <th>Posted Message</th>
    <th>Description</th>
  </tr>
  <tr>
    <td>...@CPSC310Bot...</td>
    <td>Request received; should be processed within <i>N</i> minutes.
        Note: No deliverable specified, using latest.</td>
    <td>The request has been added to the job queue. The wait time, <i>N</i>, is computed as 2 multiplied by the length of the queue. For an empty queue, <i>N</i>=2.</td>
  </tr>
  <tr>
    <td>...@CPSC310Bot...#d2...</td>
    <td>Request received; should be processed within <i>N</i> minutes.</td>
    <td>The request has been added to the job queue. The wait time, <i>N</i>, is computed as 2 multiplied by the length of the queue. For an empty queue, <i>N</i>=2.</td>
  </tr>
  <tr>
    <td>...@CPSC310Bot...#d1...</td>
    <td>Request received; should be processed within N minutes.
        Note: Running specs for previous deliverable d1.</td>
    <td>The request has been added to the job queue. The wait time, <i>N</i>, is computed as 2 multiplied by the length of the queue. For an empty queue, <i>N</i>=2.</td>
  </tr>
  <tr>
    <td>......@CPSC310Bot...#d99...</td>
    <td>Request received; should be processed within 2 minutes.
    Note: Invalid deliverable specified, using latest.</td>
    <td>The request has been added to the job queue. The wait time, <i>N</i>, is computed as 2 multiplied by the length of the queue. For an empty queue, <i>N</i>=2.</td>
  </tr>
  <tr>
    <td>...@CPSC310Bot...</td>
    <td>Request cannot be processed. Rate limit exceeded; please wait N hours before trying again.</td>
    <td></td>
  </tr>
  <tr>
    <td>...@CPSC310Bot...</td>
    <td>Request is already queued for processing.</td>
    <td></td>
  </tr>
  <tr>
    <td>...@CPSC310Bot...</td>
    <td>Request cannot be processed; not registered.</td>
    <td>The team or GitHub username for the request is not in the users document in the database.</td>
  </tr>
  <tr>
    <td></td>
    <td>Invalid Mocha output.</td>
    <td>Unable to extract the number of passes and fails from the output of the container.</td>
  </tr>
  <tr>
    <td></td>
    <td>N passing, 0 failing</td>
    <td></td>
  </tr>
  <tr>
    <td></td>
    <td>N passing, M failing
Name of first spec to fail: SpecName</td>
    <td></td>
  </tr>
  <tr>
    <td></td>
    <td>Failed to execute tests.</td>
    <td>Either execFile failed (the app.sh script returned a non-zero exit code) or the output could not be inserted into the database.</td>
  </tr>
</table>



#### Fatal errors
<table>
  <tr>
    <th>Message</th>
    <th>Cause</th>
    <th>Solution</th>
  </tr>
  <tr>
    <td>Required environment variable GITHUB_API_KEY is not set.</td>
    <td>GITHUB_API_KEY has not been set and has no default.</td>
    <td>Set GITHUB_API_KEY in web.env</td>
  </tr>
  <tr>
    <td>Failed to login to database. <i>error</i></td>
    <td>The values for DB_USERNAME and DB_PASSWORD were not accepted by the database. See <i>error</i> for details.</td>
    <td>Check that DB_USERNAME and DB_PASSWORD in web.env are correct.</td>
  </tr>
</table>



### Retrieving test results
TODO: add a view and document how to run the view.

### Viewing application logs
TODO: add a view and document how to run the view.



## Initial Setup
The testing service is a collection of Docker containers that are orchestrated using Docker Compose. Docker needs to be installed and configured to run on startup.

### Install operating system
Debian is used as the server's OS.

### Configure OS
Install the required packages and configure the Docker daemon to start automatically at boot.
See (Docker Debian Installation)[https://docs.docker.com/engine/installation/linux/debian/].
```bash
sudo apt-get update
sudo apt-get install git -y

# Refer to https://docs.docker.com/engine/installation/linux/debian/ for docker installation instructions

# Refer to https://docs.docker.com/compose/install/ for docker-compose installation instructions
```

### Configure testing service
To set up the app on production:

1.  Clone the source files from GitHub
2.  Configure the production environment file
3.  Create a persistent Docker data volume
4.  Build the service with Docker Compose

```bash
DB_ADMIN_USERNAME=
DB_ADMIN_PASSWORD=

DB_APP_USERNAME=
DB_APP_PASSWORD=

GITHUB_API_KEY=

mkdir /app
mkdir /repos

cd /app
git clone https://github.com/nickbradley/CPSC310submit.git .


cat <<EOT > ./app.env
DB_DATA_USERNAME=${DB_APP_USERNAME}
DB_DATA_PASSWORD=${DB_APP_PASSWORD}

COUCHDB_USER=${DB_ADMIN_USER}
COUCHDB_PASSWORD=${DB_ADMIN_PASSWORD}

GITHUB_API_KEY=${GITHUB_API_KEY}
EOT


# Create a persistent data volume to hold database files
sudo docker volume create --name cpsc310-couchdb-store

sudo docker build -t cpsc310/tester tester/.

# Build and start the service
cd /app
sudo docker-compose build
sudo docker-compose up -d
```




## Configure CouchDB
The following will configure the database:

1. Create Users (admin, app)
2. Create DBs (cpsc310, cpsc310-logs)
3. Assign users to DB
4. Create views for DB



Create users
```bash
# Admin user
curl -X PUT http://localhost:5984/_config/admins/${DB_ADMIN_USERNAME} \
     -k \
     -d '"'${DB_ADMIN_PASSWORD}'"'

# App user
curl -X PUT http://localhost:5984/_users/org.couchdb.user:${DB_APP_USERNAME} \
     -k \
     -u ${DB_ADMIN_USERNAME}:${DB_ADMIN_PASSWORD} \     
     -H 'content-type:application/json' \
     -d '{"name": "'${DB_APP_USERNAME}'", "password": "'${DB_APP_PASSWORD}'", "roles": [], "type": "user"}'

```

Create databases
```bash
# Create database cpsc310
curl -X PUT http://localhost:5984/cpsc310 \
     -k \
     -u ${DB_ADMIN_USERNAME}:${DB_ADMIN_PASSWORD} \
     -H 'content-type:application/json'

# Create database cpsc310-logs
curl -X PUT http://localhost:5984/cpsc310-logs \
     -k \
     -u ${DB_ADMIN_USERNAME}:${DB_ADMIN_PASSWORD} \
     -H 'content-type:application/json'
```

Assign users to database
```bash
# Add users to cpsc310
curl -X PUT http://localhost:5984/cpsc310/_security \
     -k \
     -u ${DB_ADMIN_USERNAME}:${DB_ADMIN_PASSWORD} \
     -H "Content-Type: application/json" \
     -d '{"admins": { "names": ["'${DB_ADMIN_USERNAME}'"], "roles": [] }, "members": { "names": ["'${DB_APP_USERNAME}'"], "roles": [] } }'

# Add users to cpsc310-logs
curl -X PUT http://localhost:5984/cpsc310-logs/_security \
     -k \
     -u ${DB_ADMIN_USERNAME}:${DB_ADMIN_PASSWORD} \
     -H "Content-Type: application/json" \
     -d '{"admins": { "names": ["'${DB_ADMIN_USERNAME}'"], "roles": [] }, "members": { "names": ["'${DB_APP_USERNAME}'"], "roles": [] } }'
```

Create views
```bash
# latest_run
curl -X PUT http://localhost:5984/cpsc310/_design/default \
     -u ${DB_ADMIN_USERNAME}:${DB_ADMIN_PASSWORD} \
     -H "Content-Type: application/json" \
     -d '{
          "_id" : "_design/default",
          "views" : {
            "latest_run" : {
              "map" : "function(doc){ if (doc.team && doc.user) emit(doc.team+\"/\"+doc.user, doc.timestamp)}",
              "reduce": "function(key,values,rereduce){return Math.max.apply(null, values);}"
            }
          }
        }'



```
