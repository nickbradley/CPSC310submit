/*
var https = require('https');
var fs = require('fs')
var Queue = require('bull');

// 'redis' should be defined in /etc/hosts by Docker
var jobQueue = Queue('CPSC310 Test Job Queue', '6379', 'redis');


try {
  var httpsOptions = {
    "key": fs.readFileSync('/app/cpsc310-2016Fall.key'),
    "cert": fs.readFileSync('/app/cpsc310-2016Fall.crt')
  };
}
catch (ex) {
  throw 'SSL certificate or key is missing or not accessible.';
}

https.createServer(httpsOptions, (req, res) => {
  console.log('I got a request.');
  res.writeHead(200, { 'Content-Type': 'text/plain'});
  res.end();
}).listen('4430');
*/


















console.log(process.env);

var https = require('https');
var url = require('url');
var fs = require('fs');
var winston = require('winston');
var Queue = require('bull');
//var config = require('../env.json');
//winston.transports.DailyRotateFile = require('winston-daily-rotate-file');

//
//  Setup logging
//
var date = (new Date()).toISOString();
var filename = 'logs/listener.' + date + '.log';// || 'cpsc310_default.log';

//winston.add(require('winston-daily-rotate-file'));
var logger = new (winston.Logger)({
  transports: [
    new (winston.transports.Console)(),
    new (winston.transports.File)({
      level: 'info',
      filename: filename
    })
    //,
    //new (winston.transports.File)({
    //  level: 'debug',
    //  filename: filename + '.debug',
    //  handleExceptions: true,
    //  humanReadableUnhandledException: true
    //})
    //new (winston.transports.DailyRotateFile)({ filename: '../logs/cpsc310-github-listener.log' })
  ]
});


//
//  Startup checks
//
logger.info('CPSC310 GitHub Listener has started.');

// Get environment variables
var MAX_REQUESTS = 10;

var PORT = 4430;
var REDIS_PORT =  6379;
var REDIS_ADDR = 'redis' || '127.0.0.1';
var DB_PORT = 5984;
var DB_ADDR = 'db' || '127.0.0.1';
var DB_NAME = 'cspc310';

var TOKEN = process.env.GITHUB_API_KEY;

if (!TOKEN) {
  throw 'Required environment variable GitHub API token is not set.';
}

// Setup the job and message queues
var jobQueue = Queue('CPSC310 Test Job Queue', REDIS_PORT, REDIS_ADDR);
var msgQueue = Queue('CPSC310 Test Results Queue', REDIS_PORT, REDIS_ADDR);

// Setup the database connection
var conn = url.format({protocol: 'http', hostname: DB_ADDR, port: DB_PORT, pathname: DB_NAME});
console.log("Connecting to database: ", conn);
var db = require('nano')(conn);

// Check that we connected to the users document
/*
db.head('users', function(err, _, headers) {
  if (err) {
    throw 'Failed to connect to database document "users" at ' + conn;
  }
});
*/
/*
db.get('cpsc310', function(err, body) {
    console.log(err);
    //console.log(body);
});
*/

// Read in the SSL certificate and key
try {
  var httpsOptions = {
    "key": fs.readFileSync('/app/cpsc310-2016Fall.key'),
    "cert": fs.readFileSync('/app/cpsc310-2016Fall.crt')
  };
}
catch (ex) {
  throw 'SSL certificate or key is missing or not accessible.';
}









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

      if (payload.isValid) {
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
    console.log(ex);
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
  //var repo = payload.data.pull_request.head.repo.name;
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
  var processDelay = jobQueue.count * 2 + 2; // 2 min * the number of entries in the queue; min delay is 2 min.
  var postMsg;

  db.get(fullname, function(err, doc) {
    if (err) {
      logger.error("Vaildate request error");
      postMsg = 'Request denied: invalid user/repo pair.';
      //sendGitHubPullRequestComment('Request denied: invalid user/repo pair.', postUrl);
    }
    else {
      if (doc.num_runs < MAX_REQUESTS-1) {
        postMsg = 'Request received; should be processed within ' + processDelay + ' minutes.';
        //sendGitHubPullRequestComment('Request received; should be processed within ' + processDelay + ' minutes.', postUrl);
        job = { cmd: 'docker run fedora echo hello from fedora docker', log: log, repoTests: doc };
        try {
          jobQueue.add(job);
          logger.info(log.msg + " queued for processing.", log.opts)
        }
        catch (ex) {
          logger.error('processPullRequest: Failed to add job to queue.', {"value": job, "exception": ex});
          throw 'Failed to add job to queue. Is redis running at ' + REDIS_ADDR + ':' + REDIS_PORT + '?';
        }

      }
      else {
        postMsg = 'Request denied: exceeded number of tests allowed for this repository.'
      }
    }

    sendGitHubPullRequestComment(postMsg, postUrl);
  });

}  // processPayload

/*
function canExecute(doc, requestLimit) {
//  if (repo in doc) {
    if (doc.num_runs < requestLimit-1) {
      var processDelay = jobQueue.count * 2 + 2; // 2 min * the number of entries in the queue; min delay is 2 min.
      //isNaN(processDelay) ? 0 : processDelay +
      return {accept: true, msg: 'Request received; should be processed within minutes.'};
    }
    else {
      return {accpet: false, msg: 'Request denied: exceeded number of tests allowed for this repository.'};
    }
//  }
//  else {
//    return {accpet: false, msg: 'Request denied: invaild repository.'};
//  }
}  // canExecute
*/

function sendGitHubPullRequestComment(comment, commentUrl) {
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
        sendGitHubPullRequestComment('Job done. Show the results.', log.opts.postUrl);

        console.log("I'm going to update", repoTests);
        db.insert(repoTests, function(err, body){
          if(err) {
            console.log(err);
          }
        });
        // update test count
        //users[log.opts.username][log.opts.repo].num_runs++;

        break;
    case 'failed':
    console.log(opts);
      logger.error(log.msg + " failed to execute tests.", log.opts, opts.data.error);
      sendGitHubPullRequestComment("Failed to execute tests.", log.opts.postUrl);
      break;
    default:
      logger.error('Unknown status:', status);
  };
  done();
});













// Start listening for requests

//set timeout {}
// jobQueue.on('ready', function() {})  // put below line in here
https.createServer(httpsOptions, receiveGitHubPullRequest).listen(PORT);
//https.createServer(httpsOptions, ()=>{console.log('Hello!!!!')}).listen(PORT);
logger.info('CPSC310 GitHub Listener is up and running on port ' + PORT)
