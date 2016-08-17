/**
 * @author Nick Bradley <nbrad11@cs.ubc.ca>
 * @description Listens for open pull requests from GitHub.
 * @version 1.0
 */

// Get environment variables
var MAX_REQUESTS = process.env.MAX_REQUESTS || 10;
var CRT_FILE = process.env.CRT_FILE || '/app/cpsc310-2016Fall.crt';
var KEY_FILE = process.env.KEY_FILE || '/app/cpsc310-2016Fall.key';

var PORT = process.env.PORT || 4430;
var REDIS_PORT = process.env.REDIS_PORT || 6379;
var REDIS_ADDR = process.env.REDIS_ADDR || 'cache' || '127.0.0.1';  // 'cache' is set by docker-compose in /etc/hosts
var DB_PORT = process.env.DB_PORT || 5984;
var DB_ADDR = process.env.DB_ADDR || 'db' || '127.0.0.1';  // 'db' is set by docker-compose in /etc/hosts
var DB_NAME = process.env.DB_NAME || 'cspc310';
var DB_LOGS = (process.env.DB_NAME || 'cspc310') + '-logs';


var DB_USERNAME = process.env.DB_USERNAME;
var DB_PASSWORD = process.env.DB_PASSWORD;
var TOKEN = process.env.GITHUB_API_KEY;

if (!DB_USERNAME) throw 'Required environment variable DB_USERNAME is not set.';
if (!DB_PASSWORD) throw 'Required environment variable DB_PASSWORD is not set.';
if (!TOKEN)  throw 'Required environment variable GITHUB_API_KEY is not set.';


var WORKERS = process.env.WORKERS || 1;
var CMD_TIMEOUT = process.env.CMD_TIMEOUT || 500000; // milliseconds

var CMD_SCRIPT = process.env.CMD_SCRIPT; //'execTest.sh';
var TEST_REPO_URL_ARRAY = process.env.TEST_REPO_URLS;

if (!CMD_SCRIPT) throw 'Required environment variable CMD_SCRIPT is not set.';
if (!TEST_REPO_URL_ARRAY) throw 'Required environment variable TEST_REPO_URLS is not set.';

try {
  var TEST_REPO_URLS = JSON.parse(TEST_REPO_URL_ARRAY);
  if (!Array.isArray(TEST_REPO_URLS)) throw 'not array.';
  if (TEST_REPO_URLS.length < 1) throw 'array is empty.'
}
catch (ex) {
  throw 'Required environment variable TEST_REPO_URLS is invalid: ' + ex;
}


// Load required packages
var https = require('https');
var url = require('url');
var fs = require('fs');
var winston = require('winston');
var winstonCouch = require('winston-couchdb').Couchdb;
var Queue = require('bull');
var execFile = require('child_process').execFile;

// Define logging
var logger;

// Dictionary of database docIds and num_runs.
// Used to ensure student does not exceed MAX_REQUESTS
var userRequests;

// Setup the database connection
var conn = url.format({protocol: 'http', hostname: DB_ADDR, port: DB_PORT});
var nano = require('nano')(conn);



// Setup the job and message queues
var requestQueue = Queue('CPSC310 Pull Request Queue', REDIS_PORT, REDIS_ADDR);
var dbInsertQueue = Queue('CPSC310 Database Insertion Queue', REDIS_PORT, REDIS_ADDR);
//var msgQueue = Queue('CPSC310 Test Results Queue', REDIS_PORT, REDIS_ADDR);

// Read in the SSL certificate and key
try {
  var httpsOptions = {
    "key": fs.readFileSync(KEY_FILE),
    "cert": fs.readFileSync(CRT_FILE)
  };
}
catch (ex) {
  throw 'SSL certificate or key is missing or not accessible.';
}



console.log('Preparing to start CPSC310 GitHub Listener');

// Check existence of databases and start listening for requests
nano.db.list(function(err, body){
  if (err) throw 'Failed to retrieve database list ' + err;
  if (body.indexOf(DB_NAME) < 0) throw 'Failed to connect to database ' + DB_NAME + ' at ' + conn + '. Make sure database server is running and that the database exists.';
  if (body.indexOf(DB_LOGS) < 0) throw 'Failed to connect to database ' + DB_LOGS + ' at ' + conn + '. Make sure database server is running and that the database exists.';

  // Initialize userRequests with values from the database
  dbAuth('', function(db, docId){
    db.view('student_repos', 'num_runs', function(err, body) {
      if (err) {
        throw 'Failed to initialize userRequests. Error while reading student_repos view: ' + err;
      }
      else {

        userRequests = body.rows.reduce((prev, curr) => {
          prev[curr.key] = curr.value;
          return prev;
        }, {});
      }
    });  // db.view
  });  // dbAuth


  //Setup logging with winston
  logger = new (winston.Logger)({
    transports: [
      new (winston.transports.Console)(),
      new (winston.transports.Couchdb)({
        host: DB_ADDR,
        port: DB_PORT,
        db: DB_LOGS,
        //auth: {username: 'user', password: 'password'},
        secure: false,
        level: 'info'
      })
    ]
  });

  https.createServer(httpsOptions, receiveGitHubPullRequest).listen(PORT);
  logger.info('CPSC310 GitHub Listener is up and running on port ' + PORT);
});





/**
 * Authenticates against DB
 * @param {string} docId A document id in the DB
 * @param {function} callback Function to call after successfully authenticating.
 * @throws Failed to login to database.
 */
function dbAuth(docId, callback) {
  var auth;

  nano.auth(DB_USERNAME, DB_PASSWORD, function(err, body, headers) {
    if (err) {
      throw 'Failed to login to database. ' + err;
    }

    if (headers && headers['set-cookie']) {
      auth = headers['set-cookie'][0];
    }

    // pass the handle to authenticated database connection
    callback(require('nano')({url: conn + '/' + DB_NAME, cookie: auth}), docId);
  })
};





/**
  * descsdas
 * @param {Object} req - Remote request. NodeJS http.IncomingMessage object.
 * @param {Object} res - Reponse to the request. NodeJS http.ServerRespone object.
 */
function receiveGitHubPullRequest(req, res) {
  if (req.method == 'POST' && req.headers['x-github-event'] == 'pull_request') {
    var reqPayload = '';

    req.on('data', function (data) {
      reqPayload += data;

      // kill the connection if >1MB is posted
      if (reqPayload.length > 1e6) {
        reqPayload = '';
        logger.error('Request body exceeded maximum length. The connection has been closed.');
        res.writeHead(413, {'Content-Type': 'text/plain' });
        res.end();
        res.connection.destroy();
      }
    });  // req.on data

    req.on('end', function() {
        var status = 0;

        // Extract required fields from GitHub pull request payload
        try {
          var payload = JSON.parse(reqPayload);
          var pr = {
            id: payload.pull_request.id,
            url: payload.pull_request.url,
            fullname: payload.pull_request.head.repo.full_name,
            commentUrl: payload.pull_request._links.comments.href
          };
        }
        catch (ex) {
            logger.error('Pull request payload is malformed.', reqPayload)
            res.writeHead(400, { 'Content-Type': 'text/plain'})
            res.end();
            return;
        }
        res.writeHead(200, { 'Content-Type': 'text/plain'})
        res.end();


        // Only process a pull request when it is opened
        if (payload.action != "opened") status = 3;

        // Username/Repo must exist in database
        if (userRequests[pr.fullname] === undefined) status = 2;
        else if (userRequests[pr.fullname] >= MAX_REQUESTS) status = 1;

        if (status == 0) {
          userRequests[pr.fullname]++;

          requestQueue.count().then(function(queueLength) {
            requestQueue.add(pr);
            logger.info('Request received for pull request ' + pr.fullname, pr);
            comment(pr, 'Request received; should be processed within ' + (queueLength * 2 + 2) + ' minutes.');
          });
        }
        else {
          switch (status) {
            case 1:
              logger.error('Request denied for pull request ' + pr.fullname + '. Test limit reached.');
              comment(pr, 'Request denied: exceeded number of submissions allowed for this repository.');
              break;
            case 2:
              logger.error('Request denied for pull request ' + pr.fullname + '. Invalid user/repo pair.');
              comment(pr, 'Request denied: invalid user/repo pair.');
              break;
            case 3:
              logger.error('Request was not for an opened pull request ' + pr.fullname + '. ')
          }
        }
    });  // req.on end
  }  // if pull request
  else {
    logger.info('Client request not a pull request.');
    res.writeHead(403, { 'Content-Type': 'text/plain'})
    res.end('This service only supports the GitHub Pull Request event.');
  }
}  // receiveGitHubPullRequest


/**
 * Post a message to the comments section of the Pull Request on GitHub.
 * @param {Object} pullRequest - PullRequest object with the URL to post the comment to.
 * @param {string} msg - The comment that should be posted to GitHub.
 */
function comment(pullRequest, msg) {
  var pr = pullRequest;
  var commentUrl = url.parse(pr.commentUrl);
  var comment = JSON.stringify({body: msg});

  // setup post options
  var options = {
    host: commentUrl.host,
    port: '443',
    path: commentUrl.path,
    method: 'POST',
    headers: {
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(comment),
        'User-Agent': 'cpsc310-github-listener',
        'Authorization': 'token ' + TOKEN
    }
  };

  // Set up the post request
  var req = https.request(options, function(res) {
    if (res.statusCode != 201) {
      logger.error('Failed to post comment for pull request ' + pr.fullname, pr, res.statusCode);
      userRequests[pr.fullname]--;
    }
  });

  // Post the data
  req.write(comment);
  req.end();

}  // comment

/**
 * Formats the test reults to be output as GitHub comment.
 * Output is of the form: X specs, Y failures.
 * @param {string} result - stdout from running the test container.
 */
function testResultsFormatter(result) {
  var regex = /^\d+ specs, \d+ failures$/m;
  var match = regex.exec(result);

  // accepts the stdout from the docker command
  // returns a string that will be posted to GitHub
  return match[0];
  //return result;
}

// Process queued pull requests
// Pull requests will be processed in parallel on WORKERS processes.
requestQueue.process(WORKERS, function(job, done) {
  var pr = job.data;
  var srcRepoUrl = pr.url;

  var file = ('./' + CMD_SCRIPT).replace('//', '/');
  var args = [srcRepoUrl].concat(TEST_REPO_URLS);  // [src_repo, test_repo_1, test_repo_2,...]
  var options = {
    cwd: null,  // Current working directory
    env: null,  // Environment key-value pairs
    encoding: 'utf8',
    timeout: CMD_TIMEOUT,
    maxBuffer: 500*1024,  // 500 KB
  };

  // Run the script file
  execFile(file, args, options, function(error, stdout, stderr) {
    if (error !== null)
      done(Error('Exec failed to run cmd. ' + error));
    else
      done(null, { stdout: stdout, stderr: stderr });
  });
}); //jobQueue.process
requestQueue.on('active', function(job, jobPromise) {
  var pr = job.data;
  logger.info('Started running tests for pull request ' + pr.fullname, pr);
});
requestQueue.on('completed', function(job, result) {
  var pr = job.data;
  dbInsertQueue.add({ pullRequest: pr, result: result });
  logger.info('Finished running tests for pull request ' + pr.fullname, pr);
});
requestQueue.on('failed', function(job, error) {
  var pr = job.data;
  userRequests[pr.fullname]--;
  logger.error('Executing tests failed for pull request ' + pr.fullname, pr, error);
  comment(pr, 'Failed to execute tests.');
});


// Insert results to database.
// Results are queued to be inserted into the database to prevent revision conflicts
// which occur when the same document is updated by two queued pull requests completing
// simultaneously.

// Queueing hould not be a bottleneck because running the tests takes significantly
// longer than updating the documents in the database.
dbInsertQueue.process(function(job, done) {
  var pr = job.data.pullRequest;
  var docId = pr.fullname;
  var result = job.data.result;

  dbAuth(docId, function(db, docId) {
    db.get(docId, function(err, doc) {
      if (err)
        done(Error('Error retrieving document ' + docId + '. ' + err));
      else {
        var rev = {
          _id: doc._id,
          _rev: doc._rev,
          last_run: new Date(),
          num_runs: ++doc.num_runs || 1,
          results: Array.isArray(doc.results) ? doc.results.concat(result.stdout) : [result.stdout],
          output: Array.isArray(doc.output) ? doc.output.concat(testResultsFormatter(result.stdout)) : [testResultsFormatter(result.stdout)]
        };

        db.insert(rev, function(err, body) {
          if(err)
            done(Error('Error updating document ' + docId + '. ' + err));
          else
            done(null, { output: testResultsFormatter(result.stdout) });
        });  // db.insert
      }
    });  // db.get
  })  // dbAuth
});
dbInsertQueue.on('completed', function(job, result) {
  var pr = job.data.pullRequest;
  var msg = result.output;
  logger.info('Updated database for pull request ' + pr.fullname, pr);
  comment(pr, msg);
});
dbInsertQueue.on('failed', function(job, error) {
  var pr = job.data.pullRequest;
  userRequests[pr.fullname]--;
  logger.error('Failed to update database for pull request ' + pr.fullname, pr, error);
  comment(pr, 'Failed to execute tests.');
});
