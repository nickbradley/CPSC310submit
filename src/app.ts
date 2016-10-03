///<reference path="../typings/globals/node/index.d.ts"/>
/**
 * CPSC 310 submission service.
 * @author Nick Bradley <nbrad11@cs.ubc.ca>
 */

// Application settings
interface IAppSetting {
  port: string,
  github: { username: string, token: string },
  requestLimit: { maxCount: number, minDelay: number },
  cmd: { concurrency: number, timeout: number, file: string },
  cache: { port: string, address: string },
  dbServer: { port: string, address: string, connection: string, username: string, password: string }
}

// Properties for the GitHub commit comment request
interface ISubmission {
  username: string,
  reponame: string,
  repoURL: string,
  commentURL: string,
  commitSHA: string,
  testRepoURL: string,
  deliverable: string
}

// Options for ExecFile
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

interface ITestReport {

}

// Document that is inserted into database with test results
interface IResultDoc {
  requestCommit: string,
  actualCommit: string,
  scriptStdout: string,
  scriptStderr: string,
  report: any,
  team: string,
  user: string,
  timestamp: number
  displayText: string,
  deliverable: string,
  conversation: string
}
/****************/
interface IDeliverable {
  [key: string]: any;
}








// Imports
var finalhandler = require("finalhandler");
var http         = require("http");
var https = require("https");
var Router       = require("router");
var url          = require("url");
let bodyParser = require("body-parser");
let fs = require("fs");
// submit module
var Queue = require("bull");
var execFile = require("child_process").execFile;

let winston = require("winston");
let winstonCouch = require("winston-couchdb").Couchdb;
let moment = require("moment");




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
    timeout: process.env.CMD_TIMEOUT || 5*60*1000, // milliseconds
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
let deliverables: IDeliverable = {};
let users: string[] = [];
let admins: any[] = [];
/*
let teams: Array<any> = [
  {"team": "https://github.com/CS310-2016Fall/cpsc310project", "members": ["nickbradley"]}
];
teams.forEach((team:any)=>{
  let repoName: string = team.team.substr(team.team.lastIndexOf('/') + 1);
  team.members.forEach((memeber: string) => {
    users.push(repoName + "/" + memeber);
  });
});
console.log("users", users);
*/
dbAuth(AppSetting.dbServer, (db: any) => {
  db.get("deliverables", (error:any, body: any) => {
    if (error) {
      console.log("Warning: failed to retreive deliverables document from database.");
    }
    else {
      deliverables = body;
      /*
      deliverables = {
        current: "d1",
        d1: {public: "", private: "https://github.com/CS310-2016Fall/cpsc310d1-priv.git"},
        d2: {public: "", private: ""}
      }*/
    }
  });
  db.get("teams", (error:any, body: any) => {
    if (error) {
      console.log("Warning: failed to retreive users document from database.");
    }
    else {
      updateUsers(body.teams);

      /*
      body.teams.forEach((team:any)=>{
        let repoName: string = team.team.substr(team.team.lastIndexOf('/') + 1);
        team.members.forEach((memeber: string) => {
          users.push(repoName + "/" + memeber);
        });
      });*/
    }
    //let users = body;
    //users = ["cpsc310project_team1/nickbradley", "cpsc310project/nickbradley"];
  })
  db.get("admins", (error:any, body: any) => {
  if (error) {
    console.log("Warning: failed to retreive admins documnet from database.")
  }
  else {
    admins = body.admins;
  }
})
})


let queuedOrActive: Array<string> = [];



/**
 * Runs the callback function after authenticating against the cpsc310 database.
 */
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


/**
 * Gets the most recent run date for the specified team and user from the db.
 */
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


/**
 * Searches a string for a number preceeded by #d (e.g. #d1). Will only match numbers
 * with 2 or less digits. Returns the number if found, otherwise null.
 *
 * Examples:
 *  #d1  #d01  #D1 #D01  => return 1
 *  #d99 #D99  => return 99
 *
 */
function extractDeliverable(comment: string): string {
  let deliverable: string = null;
  let matches: Array<string> = /.*#[dD](\d{1,2}).*/i.exec(comment);  // comment includes #d1 or #D1 or #d01
  if (matches) {  // if comment specifies deliverable test suite
    deliverable = "d" + +matches[1];
  }

  return deliverable;
}  // extractDeliverable


/**
 * Posts a message to GitHub.
 */
function commentGitHub(submission: ISubmission, msg: string): void {
  if (submission.commentURL) {

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
    var req = https.request(options, (res:any) => {
      if (res.statusCode != 201) {
        logger.error("Failed to post comment for " + submission.reponame + "/" + submission.username + " commit " + submission.commitSHA, submission, res.statusCode);
      }
    });

    // Post the data
    req.write(comment);
    req.end();

    console.log("**** " + msg + " ****");

  }

}  // commentGitHub


function parseScriptOutput(result: string): any {
  //console.log("****** MochaJSON DOC **********");
  //console.log(result);

  let regex: RegExp = /^[\s\S]*%@%@COMMIT:(.*)###\s*({[\s\S]*})\s*%@%@\s*$/;
  let matches: string[] = regex.exec(result);

  if (matches && matches.length == 3) {
    return {"commitSha": matches[1], "mochaJson": JSON.parse(matches[2])};
  }
  else {
    return null;
  }
}


/**
 * Takes the output from Mocha and returns only the number of pass/fails and the
 * name of the first spec to fail.
 */

 // TODO: check if vaild JSON passed
function formatTestReport(testReport: any): string {
  let output: string = "";
  let firstTestFailTitle: string = "";

  let passes: number = testReport.stats.passes;
  let fails: number = testReport.stats.failures;
  let skipped: number = testReport.stats.skipped;
  let passPercent: number = testReport.stats.passPercent;

  output = passes + " passing, " + fails + " failing, " + skipped + " skipped" + " (" + passPercent + "%)";

  if (fails) {
    let failedTests: any[] = testReport.allTests.filter((test: any) => {
      return test.fail;
    });

    firstTestFailTitle = failedTests[0].fullTitle;
    firstTestFailTitle = firstTestFailTitle.substring(0, firstTestFailTitle.indexOf(" \n\t["));
    //firstTestFailTitle = firstTestFailTitle.substring(firstTestFailTitle.lastIndexOf("~")+1);
    output += "\nName of first spec to fail: " + firstTestFailTitle;
  }
  return output;
}  // formatResult



/**
 * Resets the global users object to match teams. Should be called any time the teams
 * change.
 */
interface Team {
  team: number;
  members: string[];      // github usernames
  url?: string;           // github url (leave undefined if not set)
  projectName?: string;   // github project name
  teamName?: string;      // github team name
}

function updateUsers(teams: Team[]) {
  users = [];
  teams.forEach((team: Team) => {
    //let name: string = team.projectName || "cpsc310project_team" + team;
    let name: string = "cpsc310project_team" + team.team;
    team.members.forEach((memeber: string) => {
      users.push(name + "/" + memeber);
      console.log("Added user " + name + "/" + memeber);
    });
  });
}  // updateUsers

function isEmpty(obj:any) {
    for(var key in obj) {
        if(obj.hasOwnProperty(key))
            return false;
    }
    return true;
}  // isEmpty






let deliverableHandler = Router();
router.use("/deliverables", deliverableHandler);
deliverableHandler.use(bodyParser.json());
deliverableHandler.post("/", (req:any, res:any) => {
  if (req.headers['token'] === AppSetting.github.token) {
    var doc = req.body;
    if (isEmpty(doc))
      logger.warn("Empty deliverables document received.");

    dbAuth(AppSetting.dbServer, (db: any) => {
      db.get("deliverables", (error: any, body: any) => {
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
    res.end("Token header must be specified.");
  }
});

let usersHandler = Router();
router.use("/teams", usersHandler);
usersHandler.use(bodyParser.json());
usersHandler.post("/", (req: any, res: any) => {
  if (req.headers['token'] === AppSetting.github.token) {
    var teams = req.body;
    var doc: any = {};
    if (isEmpty(doc))
      logger.warn("Empty deliverables document received.");

    dbAuth(AppSetting.dbServer, (db: any) => {
      db.get("teams", (error: any, body: any) => {
        doc._id = "teams";
        doc.teams = teams;
        if (!error) {
          doc._rev = body._rev;
        }
        db.insert(doc, (error: any, body: any) => {
          if (error) {
            res.writeHead(500);
            res.end(JSON.stringify(error));
          }
          else {
            res.writeHead(200);
            res.end(JSON.stringify(body));
            //users = req.body;
            updateUsers(doc.teams);
          }
        });
      });
    });
  }
  else {
    res.writeHead(403);
    res.end("Token header must be specified.");
  }
});

/*
let router = Router({ mergeParams: true });
router.get("/test", (req:any, res:any) => {

  console.log(req.query);
  console.log(req.params);
  console.log(req.body);

  res.writeHead(200);
  res.end();
});
*/
/*
let gradeHandler = Router({ mergeParams: true });
//router.get("/grade", (req:any, res:any) => {
router.use("/grade", gradeHandler);
//gradeHandler.use(bodyParser.urlencoded());
gradeHandler.get("/", (req:any, res:any) => {
  console.log("Received get request");
  ///:delv
  console.log(req.query);
  console.log(req.params);
  console.log(req.body);
  let delv:string = req.query["delv"];

  console.log("delv", delv);
  if (req.headers['token'] === AppSetting.github.token) {
    let delv: string = "d1";
    if (deliverables.hasOwnProperty(delv)) {

      let submission: ISubmission;
      let testRepoURL: string = deliverables[delv].private

      dbAuth(AppSetting.dbServer, (db: any) => {
        db.get("teams", (error:any, body: any) => {
          // check for error
          if (error) {
            res.writeHead(500);
            res.end("Failed to get teams document from database.");
          }
          else {
            body.teams.forEach((team: any) => {
              let reponame: string = team.team.substr(team.team.lastIndexOf('/') + 1);
              submission = {
                username: "cpsc310bot",
                reponame: reponame,
                repoURL: team.team.replace("//", "//"+AppSetting.github.username+":"+AppSetting.github.token+"@"),
                commentURL: null,
                commitSHA: deliverables[delv].due,
                testRepoURL: testRepoURL.replace("//", "//"+AppSetting.github.username+":"+AppSetting.github.token+"@"),
                deliverable: delv
              };

              requestQueue.add(submission);
            });
            res.writeHead(200);
            res.end();
          }
        });
      });
    }
    else {
      res.writeHead(500);
      res.end("Invalid deliverable specified.");
    }
  }
  else {
    res.writeHead(403);
    res.end("Token header must be specified.");
  }

});
*/


let submitHandler = Router();
router.use("/submit", submitHandler);
submitHandler.use(bodyParser.json());
submitHandler.post("/", (req:any, res:any) => {
  console.log("Submit was POSTed to!");
  if (req.body.zen){
    console.log("New webhook was created on GitHub");
    res.writeHead(200);
    res.end("AutoTest webhook setup successfully.");
    return;
  }

  //console.log("\n\n********REQ_START********");
  //console.log(JSON.stringify(req.body);
  //console.log("\n\n********REQ_END********");

  let comment: string = req.body.comment.body.toLowerCase();
  let team: string = req.body.repository.name;
  let user: string = req.body.comment.user.login;
  let postComment: string;
  let submission: ISubmission;
  let testRepoURL: string;
  let deliverable: string;
  let msgInfo: string = "";

  if (comment.includes("@cpsc310bot")) {
    deliverable = extractDeliverable(comment);

    if (!deliverable) {
      //msgInfo = "\nNote: No deliverable specified, using latest.";
      msgInfo = "";
      deliverable = deliverables["current"];
    }

    if (deliverable == deliverables["current"]) {
      testRepoURL = deliverables[deliverables["current"]].private;
    }
    else if (deliverable < deliverables["current"] && deliverable >= "d1") {
      testRepoURL = deliverables[deliverable].private;
      msgInfo = "\nNote: Running specs for previous deliverable " + deliverable + ".";
    }
    else {
      testRepoURL = deliverables[deliverables["current"]].private;
      msgInfo = "\nNote: Invalid deliverable specified, using latest.";
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
    let adminUsers: string[] = admins.map((admin) => admin.username) || [];
    console.log(team+"/"+user);

    if (users.includes(team+"/"+user) || adminUsers.includes(user)) {
      if (!queuedOrActive.includes(jobId)) {
        getLatestRun(team, user, (latestRun:number) => {
          let runDiff: number = Date.now() - latestRun - AppSetting.requestLimit.minDelay;
          if (runDiff > 0 || adminUsers.includes(user)) {
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
            commentGitHub(submission, "Request cannot be processed. Rate limit exceeded; please wait " + moment.duration(-1*runDiff).humanize() + " before trying again.");
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
    console.log("Comment doesn't mention @cpsc310bot.");
  }

  res.writeHead(200);
  res.end();
});




// Process queued submission
// Submissions will be processed in parallel AppSetting.cmd.concurrency processes.
requestQueue.process(AppSetting.cmd.concurrency, (job: any, done: Function) => {
  let submission: ISubmission = job.data;

  let file: string = ('./' + AppSetting.cmd.file).replace('//', '/');
  let args: Array<string> = [submission.testRepoURL, submission.repoURL, submission.commitSHA];
  let options: IExecOptions = {
    timeout: AppSetting.cmd.timeout,
    maxBuffer: 100000*1024  // 500 KB
  };

  // Run the script file
  let exec = execFile(file, args, options, (error:any, stdout:any, stderr:any) => {
    if (error !== null) {
      console.log("-----------------| ERROR |----------------");
      console.log("---| STDOUT |---");
      console.log(stdout);
      console.log("---| STDERR |---");
      console.log(stderr);
      console.log("---| ERROR |---");
      console.log(error);
      done(Error(error.code));
    }
    else
      done(null, { stdout: stdout, stderr: stderr });

/*
    console.log("***** STDOUT ******");
    console.log(stdout);

    console.log("***** STDERR ******");
    console.log(stderr);
*/
  });

});
requestQueue.on('active', function(job:any, jobPromise:any) {
  let submission: ISubmission = job.data;
  logger.info("Started running tests for " + submission.reponame + "/" + submission.username + " commit " + submission.commitSHA, submission);
});
requestQueue.on('completed', function(job:any, result:any) {
  let submission: ISubmission = job.data;
  let parsedOutput: any = parseScriptOutput(result.stdout);

  //console.log("****** Output  **********")
  //console.log(result.stdout);

  let doc: IResultDoc = {
    requestCommit: submission.commitSHA,
    actualCommit: parsedOutput.commitSha,
    scriptStdout: result.stdout,
    scriptStderr: result.stderr,
    report: parsedOutput.mochaJson,
    team: submission.reponame,
    user: submission.username,
    timestamp: Date.now(),
    displayText: formatTestReport(parsedOutput.mochaJson),
    deliverable: submission.deliverable,
    conversation: "",
  }

  // Remove the jobId from queuedOrActive
  queuedOrActive.splice(queuedOrActive.indexOf(job.opts.jobId), 1);

  dbAuth(AppSetting.dbServer, (db: any) => {
    db.insert(doc, (error: any, body: any) => {
      if (error) {
        logger.error("Inserting document failed for " + submission.reponame + "/" + submission.username + " commit " + submission.commitSHA, submission, error);
        commentGitHub(submission, "Service Error: Test results could not be saved to database.");
      }
      else {
        logger.info("Finished running tests for "  + submission.reponame + "/" + submission.username + " commit " + submission.commitSHA, submission);
        commentGitHub(submission, doc.displayText);
      }
    });
  });
});
requestQueue.on('failed', function(job:any, error:any) {
  let submission: ISubmission = job.data;
  let comment: string = "";

  // Remove the jobId from queuedOrActive
  queuedOrActive.splice(queuedOrActive.indexOf(job.opts.jobId), 1);

  logger.error("Executing tests failed for " + submission.reponame + "/" + submission.username + " commit " + submission.commitSHA, submission, error);
  switch (+error.message) {
    case 7:
      comment = "Build failed. Unable to execute tests.";
      break;
    case 8:
      comment = "AutoTest Error: Failed to build test suite."
      break;
    case 9:
      comment = "AutoTest Error: Failed to run test suite."
      break;
    default:
      comment = "AutoTest Failed: This is usually caused by the script taking too long or writing too much to the console.";
      break;
  }
  commentGitHub(submission, comment);
});


var server = http.createServer((req:any, res:any) => {
  router(req, res, finalhandler(req, res));
}).listen(AppSetting.port);
