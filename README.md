# CPSC 310 Automated Submission Service for GitHub
This service consumes pull request webhooks from configured repositories on GitHub. Upon receiving a request, the service will clone the repository, run the tests and publish the results as a comment on the pull request.

## Usage
### Start the service
Connect to the server using SSH at `<hostname>:22`. After logging in, `cd ~/<appdir>` and run
`sudo docker-compose up` to start the service.

### Configure the webhook on a GitHub repository
1. Go to **Settings**, **Webhooks & services**
2. Click **Add webhook**
3. Configure the webhook:
  1. In the _Payload URL_ field, enter `https://<hostname>/cpsc310/test-service`
  2. Click **Disable SSL verification**
  3. Under Which events would you like to trigger this webhook?, select _Let me select individual events._ and choose only _Pull request_.

### Make a pull request
To make a submission, open a [pull request](https://help.github.com/articles/using-pull-requests/) on a repository configured with the submission service.

1. Navigate to the repository on GitHub.
2. Click **Fork**.
3. Make changes to your fork on a new branch.
4. To submit the changes for testing, click **New pull request**.

## Administration
### Environment Variables
### Messages and Logging
#### Service responses
<table>
  <tr>
    <th>Posted Message</th>
    <th>Description</th>
  </tr>
  <tr>
    <td>Request received; should be processed within <i>N</i> minutes.</td>
    <td>The pull request has been added to the job queue. The wait time, <i>N</i>, is computed as 2 multiplied by the length of the queue. For an empty queue, <i>N</i>=2.</td>
  </tr>
  <tr>
    <td><i>Test results</i></td>
    <td>Abbreviated test results from the Docker testing container.</td>
  </tr>
  <tr>
    <td>Request denied: exceeded number of submissions allowed for this repository.</td>
    <td>The user has already made the maximum number of pull requests allowed for the repository.</td>
  </tr>
  <tr>
    <td>Request denied: invalid user/repo pair.</td>
    <td>The GitHub user making the pull request is not registered in the database.</td>
  </tr>
  <tr>
    <td>Failed to execute tests.</td>
    <td>An error occurred while executing the tests or updating the database -- see error log for details. The failed test will not count towards the user's submission limit.</td>
  </tr>
</table>

#### Error log messages
<table>
  <tr>
    <th>Message</th>
    <th>Cause</th>
  </tr>
  <tr>
    <td>Request body exceeded maximum length. The connection has been closed.</td>
    <td>The body exceeded 1 MB.</td>
  </tr>
  <tr>
    <td>Pull request payload is malformed. <i>payload</i></td>
    <td>The request body could not be parsed into JSON or one of the fields was missing or blank:
      <ul>
        <li>pull_request.id</li>
        <li>pull_request.url</li>
        <li>pull_request.head.repo.full_name</li>
        <li>pull_request._links.comments.href</li>
      </ul>
    </td>
  </tr>
  <tr>
    <td>Request denied for pull request <i>user/repo</i>. Test limit reached.</td>
    <td><i>user</i> has exceeded the number of pull requests for the repository <i>repo</i>. This limit is set by MAX_REQUESTS in docker-compose.yml.</td>
  </tr>
  <tr>
    <td>Request denied for pull request <i>user/repo</i>. Invalid user/repo pair.</td>
    <td>The GitHub username and repository name combination is not in the database. Only registered users are permitted to use the submission service.</td>
  </tr>
  <tr>
    <td>Request was not for an opened pull request <i>user/repo</i>.</td>
    <td>A GitHub pull request has several events: Pull request opened, closed, reopened, edited, assigned, unassigned, labeled, unlabeled, or synchronized. The submission service will only process pull requests that have been opened.</td>
  </tr>
  <tr>
    <td>Failed to post comment for pull request <i>user/repo</i> {id: <i>id</i>, url: <i>url</i>, fullname: <i>user/repo</i>, commentUrl: <i>url</i>} <i>HTTP Status Code</i></td>
    <td>The status code returned by GitHub was not 201 (Created).</td>
  </tr>
  <tr>
    <td>Executing tests failed for pull request <i>user/repo</i> {id: <i>id</i>, url: <i>url</i>, fullname: <i>user/repo</i>, commentUrl: <i>url</i>} <i>error</i></td>
    <td>A error occurred while running the runTest.sh bash script which handles cloning repos and running the testing Docker container. See <i>error</i> for details.</td>
  </tr>
  <tr>
    <td>Failed to update database for pull request <i>user/repo</i> {id: <i>id</i>, url: <i>url</i>, fullname: <i>user/repo</i>, commentUrl: <i>url</i>} <i>error</i></td>
    <td>The tests were run successfully but the results were not added to the database. The database will return the reason for the failure in <i>error</i>.</td>
  </tr>
</table>

### Fatal errors
<table>
  <tr>
    <th>Message</th>
    <th>Cause</th>
    <th>Solution</th>
  </tr>
  <tr>
    <td>Required environment variable DB_USERNAME is not set.</td>
    <td>DB_USERNAME has not been set and has no default.</td>
    <td>Set DB_USERNAME in web.env</td>
  </tr>
  <tr>
    <td>Required environment variable DB_PASSWORD is not set.</td>
    <td>DB_PASSWORD has not been set and has no default.</td>
    <td>Set DB_PASSWORD in web.env</td>
  </tr>
  <tr>
    <td>Required environment variable GITHUB_API_KEY is not set.</td>
    <td>GITHUB_API_KEY has not been set and has no default.</td>
    <td>Set GITHUB_API_KEY in web.env</td>
  </tr>
  <tr>
    <td>Required environment variable CMD_SCRIPT is not set.</td>
    <td>CMD_SCRIPT has not been set and has no default.</td>
    <td>Set CMD_SCRIPT in docker-compose.yml or web.env</td>
  </tr>
  <tr>
    <td>Required environment variable TEST_REPO_URLS is not set.</td>
    <td>TEST_REPO_URLS has not been set and has no default.</td>
    <td>Set TEST_REPO_URLS in docker-compose.yml or web.env</td>
  </tr>
  <tr>
    <td>Required environment variable TEST_REPO_URLS is invalid: <i>JSON.parse() exception</i></td>
    <td>TEST_REPO_URLS environment variable failed to parse.</td>
    <td>Set TEST_REPO_URLS in docker-compose.yml or web.env as a string representing an array with at least one element.</td>
  </tr>
  <tr>
    <td>Required environment variable TEST_REPO_URLS is invalid: not array.</td>
    <td>TEST_REPO_URLS environment variable did not parse as an array.</td>
    <td>Set TEST_REPO_URLS in docker-compose.yml or web.env as a string representing an array with at least one element.</td>
  </tr>
  <tr>
    <td>Required environment variable TEST_REPO_URLS is invalid: array is empty.</td>
    <td>Parsing the TEST_REPO_URLS environment variable resulted in an empty array.</td>
    <td>Set TEST_REPO_URLS in docker-compose.yml or web.env as a string representing an array with at least one element.</td>
  </tr>
  <tr>
    <td>SSL certificate or key is missing or not accessible.</td>
    <td>The app was unable to read either the certificate or key file from the corresponding locations specified in CRT_FILE and KEY_FILE.</td>
    <td>The certificate is baked into the app image. Check the following:
      <ol>
        <li>Confirm the certificate and key file are copied to the image by checking app/Dockerfile.</li>
        <li>Confirm that the paths specified for CRT_FILE and KEY_FILE defined in docker-compose.yml match the location of the certificate and key file used in the Dockerfile.</li>
        <li>Check the permissions on the certificate and key files and make adjustments in the Dockerfile.</i>
      </ol>
    </td>
  </tr>
  <tr>
    <td>Failed to retrieve database list <i>error</i></td>
    <td>There was an error connecting to the database server. See <i>error</i> for details.</td>
    <td></td>
  </tr>
  <tr>
    <td>Failed to connect to database <var>DB_NAME</var> at <i>host:port</i>. Make sure database server is running and that the database exists.</td>
    <td>The database <var>DB_NAME</var> does not exist on the server.</td>
    <td>Create a new database with name <var>DB_NAME</var> and read/write access for <var>DB_USERNAME</var></td>
  </tr>
  <tr>
    <td>Failed to connect to database <var>DB_LOGS</var> at <i>host:port</i>. Make sure database server is running and that the database exists.</td>
    <td>The database <var>DB_LOGS</var> does not exist on the server.</td>
    <td>Create a new database with name <var>DB_LOGS</var> and read/write access for <var>DB_USERNAME</var></td>
  </tr>
  <tr>
    <td>Failed to initialize userRequests. Error while reading student_repos view: <i>error</i></td>
    <td>The app failed to get a dictionary of requests per user/repo. Likely cause is the view does not exist. See <i>error</i> for details.</td>
    <td></td>
  </tr>
  <tr>
    <td>Failed to login to database. <i>error</i></td>
    <td>The values for DB_USERNAME and DB_PASSWORD were not accepted by the database. See <i>error</i> for details.</td>
    <td>Check that DB_USERNAME and DB_PASSWORD in web.env are correct.</td>
  </tr>
</table>


#### Connect to the database
CouchDB is used as the database. Connect to CouchDB's management interface, Futon, by going to `https://<hostname>/cpsc310/db/_utils/` while the testing service is running. You will need to login to view and update the database.

Alternatively, use the following cUrl command snippets:
```bash
DB_USER=
DB_PASS=

curl -X GET https://<hostname>/cpsc310/db/... \
     -k \
     -u DB_USER:DB_PASS \
     -H 'content-type:application/json'

curl -X PUT https://<hostname>/cpsc310/db/... \
     -k \
     -u DB_USER:DB_PASS \
     -H 'content-type:application/json' \
     -d '{}'
```
where `...` is the location of the database/document, `-k` is used to ignore unsigned certificate errors and `-d '{}'` is the
JSON document to PUT.

Note: When referring to a document with a `/` in the \_id, encode the `/` with `%2F` in the cUrl URI.

### Adding GitHub users to the database
To add a user using Futon:

1.  Open the *cpsc310* database from the Overview screen.
2.  Click _New Document_.
3.  Type `<GitHub_username>/<repo_name>` as the *value* for the \_id field. Click the green checkmark and then click _Save Document_.

To add a user using cUrl:
```bash
# User name and password are setup in the Initial Setup section
DB_USER=
DB_PASS=

curl -X PUT https://<hostname>/cpsc310/db/cpsc310/<GitHub_username>%2F<repo_name> \
     -k \
     -u DB_USER:DB_PASS \
     -H 'content-type:application/json' \
     -d '{}'
```

### Retrieving test results
TODO: add a view and document how to run the view.

### Viewing application logs
TODO: add a view and document how to run the view.



## Initial Setup
The testing service is a collection of Docker containers that are orchestrated using Docker Compose. Docker needs to be installed and configured to run on startup.

### Install operating system
CentOS 7 is used as the server's OS. Download the [minimal ISO image](http://isoredirect.centos.org/centos/7/isos/x86_64/CentOS-7-x86_64-Minimal-1511.iso) and install in a virtual machine or on bare metal. During the install make sure networking is configured and add the user _cpsc310admin_ as an administrator.

### Configure OS
Install the required packages and configure the Docker daemon to start automatically at boot.
```bash
sudo yum update
sudo yum install git -y
sudo yum install docker -y
sudo yum install docker-compose -y

# Set docker to start automatically
sudo systemctl enable docker
```

### Configure testing service
To set up the app on production:

1.  Clone the source files from GitHub
2.  Configure the production environment files
3.  Install the SSL certificates
4.  Create a persistent Docker data volume
5.  Build the service with Docker Compose

```bash
DB_ADMIN_USERNAME=
DB_ADMIN_PASSWORD=

DB_APP_USERNAME=
DB_APP_PASSWORD=

DB_STD_USERNAME=
DB_STD_PASSWORD=

GITHUB_API_KEY=

CERT_CRT_PATH=
CERT_KEY_PATH=



cd ~
git clone <GitHub_repo_url> cpsc310tester

cd cpsc310tester

cat <<EOT > ./web.env
DB_USERNAME=${DB_APP_USERNAME}
DB_PASSWORD=${DB_APP_PASSWORD}
GITHUB_API_KEY=${GITHUB_API_KEY}
EOT

# Set the database administrator account
cat <<EOT > ./db.env
COUCHDB_USER=${DB_ADMIN_USERNAME}
COUCHDB_PASSWORD=${DB_ADMIN_PASSWORD}
EOT

# Copy the certificates
cp ${CERT_CRT_PATH} app/
cp ${CERT_KEY_PATH} app/

cp ${CERT_CRT_PATH} nginx/
cp ${CERT_KEY_PATH} nginx/

# Create a persistent data volume to hold database files
sudo docker volume create --name cpsc310-couchdb-store

# Build and start the service
cd ${APP_DIR}
sudo docker-compose build
sudo docker-compose up -d
```




## Configure CouchDB
The following will configure the database:

1. Create Users (admin, app, standard)
2. Create DBs (cpsc310, cpsc310-logs)
3. Assign users to DB
4. Create views for DB
5. Create documents in cpsc310



Create users
```bash
# Admin user
curl -X PUT https://<hostname>/cpsc310/db/_config/admins/${DB_ADMIN_USER} \
     -k \
     -d '"${DB_ADMIN_PASSWORD}"'

# App user
curl -X PUT https://<hostname>/cpsc310/db/_users/org.couchdb.user:${DB_APP_USERNAME} \
     -k \
     -u ${DB_ADMIN_USERNAME}:${DB_ADMIN_PASSWORD} \     
     -H 'content-type:application/json' \
     -d '{"name": "${DB_APP_USERNAME}", "password": "${DB_APP_PASSWORD}", "roles": [], "type": "user"}'

# Standard user
curl -X PUT https://<hostname>/cpsc310/db/_users/org.couchdb.user:${DB_STD_USERNAME} \
     -k \
     -u ${DB_ADMIN_USERNAME}:${DB_ADMIN_PASSWORD} \
     -H 'content-type:application/json' \
     -d '{"name": "${DB_STD_USERNAME}", "password": "${DB_STD_PASSWORD}", "roles": [], "type": "user"}'
```

Create databases
```bash
# Create database cpsc310
curl -X PUT https://<hostname>/cpsc310/db/cpsc310 \
     -k \
     -u ${DB_ADMIN_USERNAME}:${DB_ADMIN_PASSWORD} \
     -H 'content-type:application/json'

# Create database cpsc310-logs
curl -X PUT https://<hostname>/cpsc310/db/cpsc310-logs \
     -k \
     -u ${DB_ADMIN_USERNAME}:${DB_ADMIN_PASSWORD} \
     -H 'content-type:application/json'
```

Assign users to database
```bash
# Add users to cpsc310
curl -X PUT https://<hostname>/cpsc310/db/cpsc310/_security \
     -k \
     -u ${DB_ADMIN_USERNAME}:${DB_ADMIN_PASSWORD} \
     -H "Content-Type: application/json" \
     -d '{"admins": { "names": ["${DB_ADMIN_USERNAME}"], "roles": [] }, "members": { "names": ["${DB_APP_USERNAME}", "${DB_STD_USERNAME}"], "roles": [] } }'

# Add users to cpsc310-logs
curl -X PUT https://<hostname>/cpsc310/db/cpsc310-logs/_security \
     -k \
     -u ${DB_ADMIN_USERNAME}:${DB_ADMIN_PASSWORD} \
     -H "Content-Type: application/json" \
     -d '{"admins": { "names": ["${DB_ADMIN_USERNAME}"], "roles": [] }, "members": { "names": ["${DB_APP_USERNAME}", "${DB_STD_USERNAME}"], "roles": [] } }'
```

Create views
```bash
```

This command will add a single GitHub user to the database.
```bash
GITHUB_USERNAME=
GITHUB_REPONAME=

curl -X PUT https://<hostname>/cpsc310/db/cpsc310/${GITHUB_USERNAME}%2F${GITHUB_REPONAME} \
     -k \
     -u ${DB_ADMIN_USERNAME}:${DB_ADMIN_PASSWORD} \
     -H 'content-type:application/json' \
```
