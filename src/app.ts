// Declarations
interface IAppSetting {
  port: string,
  github: { username: string, token: string },
  requestLimit: { maxCount: number, minDelay: number },
  cmd: { concurrency: number, timeout: number, file: string },
  cache: { port: string, address: string },
  dbServer: { port: string, address: string, connection: string, username: string, password: string }
}

interface ISubmission {
  username: string,
  reponame: string,
  repoURL: string,
  commentURL: string,
  commitSHA: string,
  testRepoURL: string,
  deliverable: string
}

interface IExecOptions {
  cwd?: string,  // Current working directory
  env?: any,  // Environment key-value pairs
  encoding?: string,
  timeout?: number,
  maxBuffer?: number,
  killsignal?: string,
  uid?: number,
  gid?: number
}

interface IResultDoc {
  team: string,
  user: string,
  result: string,
  output: string,
  deliverable: string,
  commit: string,
  timestamp: number
}
/****************/
interface IDeliverable {
  [key: string]: any;
}








// Imports
var finalhandler = require("finalhandler");
var http         = require("http");
var Router       = require("router");
var url          = require("url");
let bodyParser = require("body-parser");

// submit module
var Queue = require("bull");
var execFile = require("child_process").execFile;

let winston = require("winston");
let winstonCouch = require("winston-couchdb").Couchdb;





// Initialization


if (!process.env.GITHUB_API_KEY) throw "Required environment variable GITHUB_API_KEY is not set.";

let AppSetting: IAppSetting = {
  port: process.env.PORT || 8080,
  github: {
    username: "cpsc310bot",
    token: process.env.GITHUB_API_KEY
  },
  requestLimit: {
    maxCount: process.env.MAX_REQUESTS || 10,
    minDelay: process.env.MIN_REQUEST_DELAY || 43200000
  },
  cmd: {
    concurrency: process.env.WORKERS || 1,
    timeout: process.env.CMD_TIMEOUT || 500000, // milliseconds
    file: process.env.CMD_SCRIPT || "app.sh",
  },
  cache: {
    port: process.env.REDIS_PORT || 6379,
    address: process.env.REDIS_ADDR || 'cache' || '127.0.0.1'  // 'cache' is set by docker-compose in /etc/host
  },
  dbServer: {
    port: process.env.DB_PORT || 5984,
    address: process.env.DB_ADDR || 'db' || '127.0.0.1',  // 'db' is set by docker-compose in /etc/hosts
    connection: url.format({
      protocol: 'http',
      hostname: process.env.DB_ADDR || 'db' || '127.0.0.1',
      port: process.env.DB_PORT || 5984
    }),
    username: process.env.DB_DATA_USERNAME || "app",
    password: process.env.DB_DATA_PASSWORD || ""
  }
}


//Setup logging with winston
let logger = new (winston.Logger)({
  transports: [
    new (winston.transports.Console)(),
    new (winston.transports.Couchdb)({
      host: AppSetting.dbServer.address,
      port: AppSetting.dbServer.port,
      db: "cpsc310-logs",
      auth: { username: AppSetting.dbServer.username, password: AppSetting.dbServer.password },
      secure: false,
      level: "info"
    })
  ]
});



let router = Router();
var requestQueue = Queue("CPSC310 Submission Queue", AppSetting.cache.port, AppSetting.cache.address);

// Setup the database connection
let nano = require("nano")(AppSetting.dbServer.connection);



// Read from db
/*
let deliverables: IDeliverable = {
  current: "d1",
  d1: {public: "", private: "https://github.com/CS310-2016Fall/cpsc310d1-priv.git"},
  d2: {public: "", private: ""}
}

// Read from db
let users = ["cpsc310project_team1/nickbradley"];
*/
let deliverables: IDeliverable;
let users;
dbAuth(AppSetting.dbServer, (db: any) => {
  db.get("deliverables", (error:any, body: any) => {
    if (error) {
      console.log("Warning: failed to retreive deliverables document from database.");
    }
    deliverables = body;
  });
  db.get("users", (error:any, body: any) => {
    if (error) {
      console.log("Warning: failed to retreive users document from database.");
    }

    //let users = body;
    users = ["cpsc310project_team1/nickbradley", "cpsc310project/nickbradley"];
  })
})


let queuedOrActive: Array<string> = [];




function dbAuth(dbServer: any, callback: Function): void {
  nano.auth(dbServer.username, dbServer.password, (err: any, body:any, headers:any) => {
    let auth:any;
    if (err) {
      throw "Failed to login to database. " + err;
    }

    if (headers && headers['set-cookie']) {
      auth = headers['set-cookie'][0];
    }

    // pass the handle to authenticated database connection
    //require("nano")({url: dbServer.connection + "/cpsc310", cookie: auth});

    callback(require("nano")({url: dbServer.connection + "/cpsc310", cookie: auth}));
  });
}  // dbAuth



function getLatestRun(team: string, user: string, callback: Function): void {
  let viewParams = {
    key: team + "/" + user,
    group:true
  }
  dbAuth(AppSetting.dbServer, (db: any) => {
    // view needs to group by team & user then return max timestamp
    db.view("default", "latest_run", viewParams, (err: any, body: any) => {
      if (err) {
        callback(0);
      }
      else {
        // body = {rows:[{key: "", value: ""}]}
        callback(body.rows[0] && body.rows[0].value || 0);
      }
    });
  });
}  // latestRun




var server = http.createServer((req:any, res:any) => {
  router(req, res, finalhandler(req, res));
}).listen(AppSetting.port);



let deliverableHandler = Router();
router.use("/deliverable", deliverableHandler);
deliverableHandler.use(bodyParser.json());
deliverableHandler.post("/", (req:any, res:any) => {
  if (req.headers['token'] === AppSetting.github.token) {
    dbAuth(AppSetting.dbServer, (db: any) => {
      db.get("deliverables", (error: any, body: any) => {
        var doc = req.body;
        doc._id = "deliverables";

        if (!error) {
          doc._rev = body._rev;
        }
        db.insert(doc, (error: any, body: any) => {
          if (error) {
            res.writeHead(500);
            res.end();
          }
          else {
            res.writeHead(200);
            res.end();
            deliverables = req.body;
          }
        });
      });
    });
  }
  else {
    res.writeHead(403);
    res.end();
  }
});

let usersHandler = Router();
router.use("/users", usersHandler);
usersHandler.use(bodyParser.json());
usersHandler.post("/", (req: any, res: any) => {
  if (req.headers['token'] === AppSetting.github.token) {
    dbAuth(AppSetting.dbServer, (db: any) => {
      db.get("users", (error: any, body: any) => {
        var doc = req.body;
        doc._id = "users";

        if (!error) {
          doc._rev = body._rev;
        }
        db.insert(doc, (error: any, body: any) => {
          if (error) {
            res.writeHead(500);
            res.end();
          }
          else {
            res.writeHead(200);
            res.end();
            users = req.body;
          }
        });
      });
    });
  }
  else {
    res.writeHead(403);
    res.end();
  }
});

/*
let gradeHandler = Router();
router.use("/grade", gradeHandler);
gradeHandler.use();
gradeHandler.get("/", (req:any, res:any) => {

});
*/

let submitHandler = Router();
router.use("/submit", submitHandler);
submitHandler.use(bodyParser.json());
submitHandler.post("/", (req:any, res:any) => {
  console.log("Submit was POSTed to!");

  let comment: string = req.body.comment.body.toLowerCase();
  let team: string = req.body.repository.name;
  let user: string = req.body.comment.user.login;
  let postComment: string;
  let submission: ISubmission;
  let testRepoURL: string;
  let deliverable: string;
  let msgInfo: string = "";

  if (comment.includes("@cpsc310bot")) {
    deliverable = extractDeliverable(comment) || deliverables["current"];

    if (deliverable == deliverables["current"]) {
      testRepoURL = deliverables[deliverables["current"]].private;
    }
    else if (deliverable < deliverables["current"] && deliverable >= "d1") {
      testRepoURL = deliverables[deliverable].private;
      msgInfo = "\nInfo: Running specs for previous deliverable " + deliverable + ".";
    }
    else {
      testRepoURL = deliverables[deliverables["current"]].private;
      msgInfo = "\nWarn: Invalid deliverable specified, using latest.";
    }

    submission = {
      username: req.body.comment.user.login,
      reponame: req.body.repository.name,
      repoURL: req.body.repository.html_url.replace("//", "//"+AppSetting.github.username+":"+AppSetting.github.token+"@"),
      commentURL: req.body.repository.commits_url.replace("{/sha}", "/" + req.body.comment.commit_id) + "/comments",
      commitSHA: req.body.comment.commit_id,
      testRepoURL: testRepoURL.replace("//", "//"+AppSetting.github.username+":"+AppSetting.github.token+"@"),
      deliverable: deliverable
    };
    let jobId: string = submission.reponame + "/" + submission.username;

    if (users.includes(team+"/"+user)) {
      if (!queuedOrActive.includes(jobId)) {
        getLatestRun(team, user, (latestRun:number) => {
          let runDiff: number = Date.now() - latestRun - AppSetting.requestLimit.minDelay;
          if (runDiff > 0) {
            queuedOrActive.push(jobId);
            requestQueue.add(submission, {jobId: jobId});

            requestQueue.count().then((queueLength: number) => {
              logger.info("Request received for " + submission.reponame + "/" + submission.username + " commit " + submission.commitSHA, submission);
              commentGitHub(submission, "Request received; should be processed within " + (queueLength * 2 + 2) + " minutes." + msgInfo);
            });
          }
          else {
            // too early to run next test
            logger.info("Rate limit exceeded for " + submission.reponame + "/" + submission.username + " commit " + submission.commitSHA, submission);
            commentGitHub(submission, "Request cannot be processed. Rate limit exceeded; please wait " + -1*runDiff + "ms before trying again.");
          }
        });
      }
      else {
        logger.info("Request is already queued for " + submission.reponame + "/" + submission.username + " commit " + submission.commitSHA, submission);
        commentGitHub(submission, "Request is already queued for processing.");
      }
    }
    else {
      // don't process - team/user is not registered
      logger.info("User not registered for requests for " + submission.reponame + "/" + submission.username + " commit " + submission.commitSHA, submission);
      commentGitHub(submission, "Request cannot be processed; not registered.");
    }
  }
  else {
    // don't process - comment doesn't include @cpsc310bot
  }

  res.writeHead(200);
  res.end();
});


function extractDeliverable(comment: string): string {
  let deliverable: string = null;
  let matches: Array<string> = /.*#[dD](\d{1,2}).*/i.exec(comment);  // comment includes #d1 or #D1 or #d01
  if (matches) {  // if comment specifies deliverable test suite
    deliverable = "d" + +matches[1];
  }

  return deliverable;
}  // extractDeliverable


function commentGitHub(submission: ISubmission, msg: string): void {
/*
  let commentUrl: any = url.parse(submission.commentURL);
  let comment: string = JSON.stringify({body: msg});

  // setup post options
  let options: any = {
    host: commentUrl.host,
    port: '443',
    path: commentUrl.path,
    method: 'POST',
    headers: {
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(comment),
        'User-Agent': 'cpsc310-github-listener',
        'Authorization': 'token ' + AppSetting.github.token
    }
  };

  // Set up the post request
  var req = https.request(options, (res) => {
    if (res.statusCode != 201) {
      logger.error("Failed to post comment for " + submission.reponame + "/" + submission.username + " commit " + submission.commitSHA, submission, res.statusCode);
    }
  });

  // Post the data
  req.write(comment);
  req.end();
  */
  console.log("**** " + msg + "****");
}  // commentGitHub

function formatResult(result: any): any {
  let passMatches: Array<string> = /^.*(\d+) passing.*$/m.exec(result);
  let failMatches: Array<string> = /^.*(\d+) failing.*$/m.exec(result);

  let passes: number = 0;
  let fails: number = 0;

  if (passMatches)
    passes = +passMatches[1];

  if (failMatches)
    fails = +failMatches[1];

  if (passes == 0 && fails == 0)
    return "Invalid Mocha output.";
  else
    return passes + " passing, " + fails + " failing";
}  // formatResult

// Process queued submission
// Submissions will be processed in parallel AppSetting.cmd.concurrency processes.
requestQueue.process(AppSetting.cmd.concurrency, (job: any, done: Function) => {
  let submission: ISubmission = job.data;

  let file: string = ('./' + AppSetting.cmd.file).replace('//', '/');
  let args: Array<string> = [submission.testRepoURL, submission.repoURL, submission.commitSHA];
  let options: IExecOptions = {
    timeout: AppSetting.cmd.timeout,
    maxBuffer: 500*1024  // 500 KB
  };

  console.log(file, args);

  // Run the script file
  let exec = execFile(file, args, options, (error:any, stdout:any, stderr:any) => {
    if (error !== null)
      done(Error('Exec failed to run cmd. ' + error));
    else
      done(null, { stdout: stdout, stderr: stderr });
  });

});
requestQueue.on('active', function(job:any, jobPromise:any) {
  let submission: ISubmission = job.data;
  logger.info("Started running tests for " + submission.reponame + "/" + submission.username + " commit " + submission.commitSHA, submission);
});
requestQueue.on('completed', function(job:any, result:any) {
  let submission: ISubmission = job.data;
  let doc: IResultDoc = {
    team: submission.reponame,
    user: submission.username,
    result: result,
    output: formatResult(result.stdout),
    deliverable: submission.deliverable,
    commit: submission.commitSHA,
    timestamp: Date.now()
  }

  // Remove the jobId from queuedOrActive
  queuedOrActive.splice(queuedOrActive.indexOf(job.opts.jobId), 1);

  dbAuth(AppSetting.dbServer, (db: any) => {
    db.insert(doc, (error: any, body: any) => {
      if (error) {
        logger.error("Inserting document failed for " + submission.reponame + "/" + submission.username + " commit " + submission.commitSHA, submission, error);
        commentGitHub(submission, 'Failed to execute tests.');
      }
      else {
        logger.info("Finished running tests for "  + submission.reponame + "/" + submission.username + " commit " + submission.commitSHA, submission);
        commentGitHub(submission, doc.output);
      }
    });
  });
});
requestQueue.on('failed', function(job:any, error:any) {
  let submission: ISubmission = job.data;

  // Remove the jobId from queuedOrActive
  queuedOrActive.splice(queuedOrActive.indexOf(job.opts.jobId), 1);

  logger.error("Executing tests failed for " + submission.reponame + "/" + submission.username + " commit " + submission.commitSHA, submission, error);
  commentGitHub(submission, 'Failed to execute tests.');
});