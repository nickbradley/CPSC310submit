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







let router = Router();

let testHandler = Router({ mergeParams: true });
router.use("/test", testHandler);
testHandler.get("/", (req:any, res:any) => {
  if (req.headers.accept && req.headers.accept == "text/event-stream") {
    sendSSE(req, res);
  }
  else {
    fs.readFile('view/index.html', 'utf8', function (err: Error, file: Buffer) {
      if (err) {
        res.send(500);
        console.log(JSON.stringify(err));
      }
      res.write(file);
      res.end();
    })
  }
});
testHandler.use(bodyParser.urlencoded({extended:true}));
testHandler.post("/", (req:any, res:any) => {

//   var str = "https://github.com/CS310-2016Fall/cpsc310project_team2/commit/9a56aba70d0e7e491a0882c868fa3e211131081c";
// var str = "https://github.com/CS310-2016Fall/cpsc310project_team2"
//   var regex = /^https:\/\/github.com\/CS310-2016Fall\/cpsc310project_team(\d+)(?:\/commit\/(\w+))?$/;
// regex.exec(str);

  var body = req.body;

  let regex: RegExp = /^https:\/\/github.com\/CS310-2016Fall\/cpsc310project_team(\d+)(?:\/commit\/(\w+))?$/;
  let matches: string[] = regex.exec(body.githubUrl);

  if (matches && matches[1]) {

    var team = matches[1];

    var reponame = "cpsc310project_team" + team;
    var repoUrl = "https://github.com/CS310-2016Fall/cpsc310project_team" + team;
    var commit = matches[2] || "";;
    //var testRepoURL = deliverables[body.deliverable].private;
    var submission = {
      username: "CPSC310Bot",
      reponame: reponame,
      //repoURL: repoUrl.replace("//", "//"+AppSetting.github.username+":"+AppSetting.github.token+"@"),
      commentURL: "",
      commitSHA: commit,
      //testRepoURL: testRepoURL.replace("//", "//"+AppSetting.github.username+":"+AppSetting.github.token+"@"),
      //deliverable: body.deliverable,
      show: false
    };

    //requestQueue.add(submission);
    console.log(submission);
    res.writeHead(200);
  }
  else
    res.writeHead(200);
  res.end();
});

function sendSSE(req, res) {
  res.writeHead(200, {
    'Content-Type': 'text/event-stream',
    'Cache-Control': 'no-cache',
    'Connection': 'keep-alive'
  });

  //var id = (new Date()).toLocaleTimeString();

  // Sends a SSE every 5 seconds on a single connection.
  // setInterval(function() {
  //   constructSSE(res, id, (new Date()).toLocaleTimeString());
  // }, 5000);

  setTimeout(function() {
    console.log("Timeout called");
    constructSSE(res, (new Date()).toLocaleTimeString());
  }, 5000);

  //constructSSE(res, id, (new Date()).toLocaleTimeString());
}

function constructSSE(res, data) {
  //res.write('id: ' + id + '\n');
  //res.write("data: " + data + '\n\n');
  var payload = JSON.stringify({
    "team": {"name": "team 9", "url": "http://google.ca"},
    "commit": {"sha": "1234", "url": ""},
    "callee": {"name": "cpsc310bot", "url": ""},
    "deliverable": {"name": "d1", "url": ""},
    "grade": {"value":"", "url":""}
  });
  console.log("Sending data", payload);
  res.write("data: " + payload + "\n\n");
}











var server = http.createServer((req:any, res:any) => {
  router(req, res, finalhandler(req, res));
}).listen(4321);
