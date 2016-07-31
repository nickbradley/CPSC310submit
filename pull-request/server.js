/**
 * @author Nick Bradley <nbrad11@cs.ubc.ca>
 * @summary
 * @description Listens to pull requests from GitHub.
 * @version 1.0
 */

// Get environment variables
var MAX_REQUESTS = process.env.MAX_REQUESTS || 10;
var CRT_FILE = process.env.CRT_FILE || '/app/cpsc310-2016Fall.crt';
var KEY_FILE = process.env.KEY_FILE || '/app/cpsc310-2016Fall.key';

var PORT = process.env.PORT || 4430;
var REDIS_PORT = process.env.REDIS_PORT || 6379;
var REDIS_ADDR = process.env.REDIS_ADDR || 'redis' || '127.0.0.1';  // 'redis' is set by docker-compose in /etc/hosts
var DB_PORT = process.env.DB_PORT || 5984;
var DB_ADDR = process.env.DB_ADDR || 'db' || '127.0.0.1';  // 'db' is set by docker-compose in /etc/hosts
var DB_NAME = process.env.DB_NAME || 'cspc310';
var DB_LOGS = (process.env.DB_NAME || 'cspc310') + '-logs';


var DB_USERNAME = 'jan';
var DB_PASSWORD = 'apple';
var TOKEN = process.env.GITHUB_API_KEY;

if (!DB_USERNAME) throw 'Required environment variable DB_USERNAME is not set.';
if (!DB_PASSWORD) throw 'Required environment variable DB_PASSWORD is not set.';
if (!TOKEN)  throw 'Required environment variable GITHUB_API_KEY is not set.';


var WORKERS = process.env.WORKERS || 1;
var CMD_TIMEOUT = process.env.CMD_TIMEOUT || 500000; // milliseconds

var CMD_SCRIPT = process.env.CMD_SCRIPT; //'execTest.sh';
var TEST_REPO_URL = process.env.TEST_REPO_URL;

if (!CMD_SCRIPT) throw 'Required environment variable CMD_SCRIPT is not set.';
if (!TEST_REPO_URL) throw 'Required environment variable TEST_REPO_URL is not set.';




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

// Setup the database connection
var conn = url.format({protocol: 'http', hostname: DB_ADDR, port: DB_PORT});
var nano = require('nano')(conn);



// Setup the job and message queues
var jobQueue = Queue('CPSC310 Test Job Queue', REDIS_PORT, REDIS_ADDR);
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


var userRequests;
/* = {
  "nickbradley/Test": 0
};*/

dbAuth('', function(db, docId){
  db.view('student_repos', 'num_runs', function(err, body) {
    if (err) {
      console.log('Error getting number of runs', err);
    }
    else {
      userRequests =body.rows.reduce(function(o, v, i) {
        o[i] = {v.key: v.value};
        return o;
      }, {});

      console.log('userRequests ', userRequests);
    }
  })
})

//logger.info('CPSC310 GitHub Listener has started.');

// Check that connections to db and redis succeeded and start listening


// Start listening for requests

//set timeout {}
// jobQueue.on('ready', function() {})  // put below line in here

console.log('Preparing to start CPSC310 GitHub Listener');

// Check existence of databases and start listening for requests
nano.db.list(function(err, body){
  if (err) throw 'Failed to retrieve database list ' + err;
  if (body.indexOf(DB_NAME) < 0) throw 'Failed to connect to database ' + DB_NAME + ' at ' + conn + '. Make sure database server is running and that the database exists.';
  if (body.indexOf(DB_LOGS) < 0) throw 'Failed to connect to database ' + DB_LOGS + ' at ' + conn + '. Make sure database server is running and that the database exists.';

  //Setup logging with winston
  logger = new (winston.Logger)({
    transports: [
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
  //startMessageQueue();

  logger.info('CPSC310 GitHub Listener is up and running on port ' + PORT);
});





/**
 * Authenticates against DB
 * @param {string} doc A document id in the DB
 * @param callback Function to call after successfully authenticating.
 * @throws Failed to login to database.
 */
function dbAuth(docId, callback) {
  var auth;

  nano.auth(DB_USERNAME, DB_PASSWORD, function(err, body, headers) {
    if (err) {
      throw 'Failed to login to database.';
    }

    if (headers && headers['set-cookie']) {
      auth = headers['set-cookie'][0];
    }

    callback(require('nano')({url: conn + '/' + DB_NAME, cookie: auth}), docId);
  })
};





function receiveGitHubPullRequest(req, res) {
  if (req.method == 'POST' && req.headers['x-github-event'] == 'pull_request') {
    var reqPayload = '';

    req.on('data', function (data) {
      reqPayload += data;

      // kill the connection if >1MB is posted
      if (reqPayload.length > 1e6) {
        reqPayload = '';
        logger.error('receiveGitHubPullRequest: Request body exceeded maximum length.');
        res.writeHead(413, {'Content-Type': 'text/plain' });
        res.end();
        res.connection.destroy();
      }
    });  // req.on data

    req.on('end', function() {
      var payload = parsePayload(reqPayload);

      if (payload.isValid && payload.data.action == "opened") {
        res.writeHead(200, { 'Content-Type': 'text/plain'})
        res.end();

        processPayload(payload);
      }  // if payload.isVaild
      else {
        res.writeHead(400, { 'Content-Type': 'text/plain'})
        res.end();
      }
    });  // req.on end
  }  // if pull request
  else {
    res.writeHead(400, { 'Content-Type': 'text/plain'})
    res.end();
  }
}  // receiveGitHubPullRequest


function parsePayload(payload) {
  var parsedPayload, username, repo, postUrl, id, fullname, url;

  // try converting to JSON
  try {
    parsedPayload = JSON.parse(payload);
  }
  catch (ex) {
    logger.error('Failed to parse payload.', payload);
    return {isValid: false};
  }

  // Check for required fields
  try {
    postUrl = parsedPayload.pull_request._links.comments.href;
    id = parsedPayload.pull_request.id;
    fullname = parsedPayload.pull_request.head.repo.full_name;
    url = parsedPayload.pull_request.url;
  }
  catch(ex) {
    logger.error('Failed to extract required field from payload.', ex);
    return {isValid: false};
  }

  if (postUrl && id && fullname && url)
    return {isValid: true, data: parsedPayload};
  else {
    logger.error('Requied field is empty.');
    return {isValid: false};
  }
}  // parsePayload


function processPayload(payload) {
  var fullname = payload.data.pull_request.head.repo.full_name;
  var repoId = payload.data.pull_request.id;
  var repoUrl = payload.data.pull_request.url;
  var postUrl = payload.data.pull_request._links.comments.href;
  var log = {
    "msg": "Pull request " + repoId + " for " + fullname,
    "opts": {
      "pull_requst_id": repoId,
      "user": fullname,
      "url": repoUrl,
      "postUrl": postUrl
    }
  };

  if (userRequests[fullname] !== undefined) {
    if (userRequests[fullname] < MAX_REQUESTS-1) {
      jobQueue.count().then(function(queueLength) {
        try {
          jobQueue.add({ log: log, repoTests: fullname });
          logger.info(log.msg + " queued for processing.", log.opts);
          sendGitHubPullRequestComment(postUrl, 'Request received; should be processed within ' + (queueLength * 2 + 2) + ' minutes.');
          userRequests[fullname]++;
        }
        catch (ex) {
          logger.error('processPullRequest: Failed to add job to queue.', ex);
          throw 'Failed to add job to queue. Is redis running at ' + REDIS_ADDR + ':' + REDIS_PORT + '?';
        }
      }).catch(function(reason) {
            console.log('Handle rejected promise ('+reason+') here.');
        });
    }
    else {
      sendGitHubPullRequestComment(postUrl, 'Request denied: exceeded number of tests allowed for this repository.');
    }
  }
  else {
    logger.error("Vaildate request error");
    sendGitHubPullRequestComment(postUrl, 'Request denied: invalid user/repo pair.');
  }
/*
  dbAuth(fullname.replace('/', '|'), function(db, doc) {
    db.get(doc, function(err, doc) {
      if (err) {
        logger.error("Vaildate request error");
        sendGitHubPullRequestComment(postUrl, 'Request denied: invalid user/repo pair.');
      }
      else {
        // check that db document is initialized
        if (!doc.num_runs) doc.num_runs = 0;
        if (!doc.last_run) doc.last_run = null;
        if (!doc.results) doc.results = [];
        if (!doc.abbrv_results) doc.abbrv_results = [];

        if (doc.num_runs < MAX_REQUESTS-1) {
          jobQueue.count().then(function(queueLength) {
              sendGitHubPullRequestComment(postUrl, 'Request received; should be processed within ' + (queueLength * 2 + 2) + ' minutes.');

              try {
                jobQueue.add({ log: log, repoTests: doc });
                logger.info(log.msg + " queued for processing.", log.opts)
              }
              catch (ex) {
                logger.error('processPullRequest: Failed to add job to queue.', {"value": job, "exception": ex});
                throw 'Failed to add job to queue. Is redis running at ' + REDIS_ADDR + ':' + REDIS_PORT + '?';
              }
          })
        }
        else {
          sendGitHubPullRequestComment(postUrl, 'Request denied: exceeded number of tests allowed for this repository.');
        }
      }
    });  // db.get
  });  // dbAuth
  */
};  // processPayload


function sendGitHubPullRequestComment(commentUrl, comment) {
  // Check that comment is valid JSON and has property "body"
  //if (!comment || !comment.hasOwnProperty('body')) {
  //  logger.error('sendGitHubPullRequestComment: Required parameter comment is missing property body.');
  //  logger.debug('sendGitHubPullRequestComment: Required parameter comment is missing property body.', {"value": commentJSON});
  //  return;
  //}

  // Check that commentUrl is a valid URL
  if (!commentUrl) {
    logger.error('sendGitHubPullRequestComment: Required parameter commentUrl is missing or empty.')
    return;
  }
  try {
    var commentUrlParts = url.parse(commentUrl);
  }
  catch (ex) {
    logger.error('sendGitHubPullRequestComment: Required parameter commentUrl is not a valid URL.');
    logger.debug('sendGitHubPullRequestComment: Required parameter commentUrl is not a valid URL.', {"value": commentUrl, "exception": ex});
    return;
  }

  var commentString = JSON.stringify({body: comment});
  // setup post options
  var options = {
    host: commentUrlParts.host,
    port: '443',
    path: commentUrlParts.path,
    method: 'POST',
    headers: {
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(commentString),
        'User-Agent': 'cpsc310-github-listener',
        'Authorization': 'token ' + TOKEN
    }
  };
console.log("*** Comment posted to github:", comment);
  // Set up the post request
  /*
  var req = https.request(options, function(res) {
      var response = '';

      res.on('data', function(data) {
        response += data;

        // kill the connection if >1MB is posted
        if (response.length > 1e6) {
          response = '';
          logger.error('sendGitHubPullRequestComment: Response body exceeded maximum length.');
          res.connection.destroy();
        }
      });

      res.on('end', function() {
        // TODO Check that the comment was posted
        logger.info('Comment posted to ' + commentUrlParts.href);
        logger.debug('sendGitHubPullRequestComment: Comment posted to ' + commentUrlParts.href, {"comment": comment, "response": response});
      });
  });

  // Post the data
  req.write(commentString);
  req.end();
  */
}  // sendGitHubPullRequestComment

dbInsertQueue.process(function(job, done) {
  var docId = job.data.docId;
  var result = job.data.result;

  dbAuth(docId, function(db, docId) {
    db.get(docId, function(err, doc) {
      if (err) {
        console.log('Error retrieving document ' + docId + '.', err);
        done();
      }
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
          if(err) {
            console.log('Error updating document ' + docId + '.', err);
            done();
          }
          else {
            console.log('********** JOB '+ job.jobId +' COMPLETED *****************');
            done();
          }
        })  // db.insert
      }
    })  // db.get
  })  // dbAuth
});


function testResultsFormatter(result) {
  // accepts the stdout from the docker command
  // returns a string that will be posted to GitHub
  return result;
}

jobQueue.on('active', function(job, jobPromise) {
  logger.info(job.data.log.msg + " has started running tests.", job.data.log.opts);
});

jobQueue.on('completed', function(job, result) {
  var fullname = "nickbradley/Test";
  dbInsertQueue.add({docId: fullname, result: result});
});

jobQueue.on('failed', function(job, error) {
  console.log('Job failed with error', error);
  logger.error(job.data.log.msg + ' failed to execute tests.', job.data.log.opts, error);
  sendGitHubPullRequestComment(job.data.log.opts.postUrl, 'Failed to execute tests.');
  //console.log(error);
  //msgQueue.add({status:'failed', log: job.data.log, error: error});
});


jobQueue.process(10, function(job, done){
  console.log('--------------| Processing Job ' + job.jobId + ' |------------------');
  var log = job.data.log;
  var repoTests = job.data.repoTests;
  var cmd = ('./' + CMD_SCRIPT).replace('//', '/');
  var srcRepoUrl = job.data.log.opts.url;
  var testRepoUrl = TEST_REPO_URL;
  var execOpts = {
    cwd: null,  // Current working directory
    env: null,  // Environment key-value pairs
    encoding: 'utf8',
    timeout: CMD_TIMEOUT,
    maxBuffer: 500*1024,  // 500 KB
  };

  if (!cmd || !srcRepoUrl || !testRepoUrl) {
    done(Error('Parameter opts missing property cmd, srcReporUrl or testRepoUrl.'));
  }

  // Run the script file
  execFile(cmd, [testRepoUrl, srcRepoUrl], execOpts, function(error, stdout, stderr) {
    if (error !== null) {
      console.log('stdout', stdout);
      console.log('stderr', stderr);
      console.log('error', error);
      console.log('------------------[ERROR]------------------');
      done(Error('Exec failed to run cmd.'));
    }
    else {
      console.log(stdout);
      console.log(stderr);
      done(null, { stdout: stdout, stderr: stderr, log: log, repoTests: repoTests });
    }
  });

}); //jobQueue.process




function startMessageQueue() {
// Send results as the tests finish
msgQueue.process(function(opts, done) {
  var log = opts.data.log;
  var status = opts.data.status;
  var username = "nickbradley";
  var repo = "Test";
  var repoTests = opts.data.repoTests;

  switch (status) {
    case 'active':
      logger.info(log.msg + " has started running tests.", log.opts);
      break;
    case 'completed':
        logger.info(log.msg + " has finished running tests.", log.opts);
        /*
        dbAuth(repoTests, function(db, doc){
          db.insert(doc, function(err, body){
            if(err) {
              console.log(err);
              logger.error('Failed to update database record', err);
              sendGitHubPullRequestComment(log.opts.postUrl, 'Failed to update database record');
            }
            else {
              sendGitHubPullRequestComment(log.opts.postUrl, 'Job done. Show the results.');
            }
          })
        });
        */
        console.log('********** TESTS COMPLETED *****************');
        break;
    case 'failed':
    console.log(opts.data.error);
      logger.error(log.msg + ' failed to execute tests.', log.opts, opts.data.error);
      sendGitHubPullRequestComment(log.opts.postUrl, 'Failed to execute tests.');
      break;
    default:
      logger.error('Unknown status:', status);
  };
  done();
});
}
