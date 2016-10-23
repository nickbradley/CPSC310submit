var finalhandler = require("finalhandler");
var http = require("http");
var https = require("https");
var Router = require("router");
var url = require("url");
var bodyParser = require("body-parser");
var fs = require("fs");
var Queue = require("bull");
var execFile = require("child_process").execFile;
var winston = require("winston");
var winstonCouch = require("winston-couchdb").Couchdb;
var moment = require("moment");
var router = Router();
var testHandler = Router({ mergeParams: true });
router.use("/test", testHandler);
testHandler.get("/", function (req, res) {
    if (req.headers.accept && req.headers.accept == "text/event-stream") {
        sendSSE(req, res);
    }
    else {
        fs.readFile('view/index.html', 'utf8', function (err, file) {
            if (err) {
                res.send(500);
                console.log(JSON.stringify(err));
            }
            res.write(file);
            res.end();
        });
    }
});
testHandler.use(bodyParser.urlencoded({ extended: true }));
testHandler.post("/", function (req, res) {
    var body = req.body;
    var regex = /^https:\/\/github.com\/CS310-2016Fall\/cpsc310project_team(\d+)(?:\/commit\/(\w+))?$/;
    var matches = regex.exec(body.githubUrl);
    if (matches && matches[1]) {
        var team = matches[1];
        var reponame = "cpsc310project_team" + team;
        var repoUrl = "https://github.com/CS310-2016Fall/cpsc310project_team" + team;
        var commit = matches[2] || "";
        ;
        var submission = {
            username: "CPSC310Bot",
            reponame: reponame,
            commentURL: "",
            commitSHA: commit,
            show: false
        };
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
    setTimeout(function () {
        console.log("Timeout called");
        constructSSE(res, (new Date()).toLocaleTimeString());
    }, 5000);
}
function constructSSE(res, data) {
    var payload = JSON.stringify({
        "team": { "name": "team 9", "url": "http://google.ca" },
        "commit": { "sha": "1234", "url": "" },
        "callee": { "name": "cpsc310bot", "url": "" },
        "deliverable": { "name": "d1", "url": "" },
        "grade": { "value": "", "url": "" }
    });
    console.log("Sending data", payload);
    res.write("data: " + payload + "\n\n");
}
var server = http.createServer(function (req, res) {
    router(req, res, finalhandler(req, res));
}).listen(4321);
//# sourceMappingURL=hand.js.map