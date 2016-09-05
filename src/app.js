var deliverables = {
    current: "d1",
    d1: { public: "", private: "https://github.com/CS310-2016Fall/cpsc310d1-priv.git" },
    d2: { public: "", private: "" }
};
var finalhandler = require("finalhandler");
var http = require("http");
var Router = require("router");
var url = require("url");
var bodyParser = require("body-parser");
var Queue = require("bull");
var execFile = require("child_process").execFile;
if (!process.env.GITHUB_API_KEY)
    throw "Required environment variable GITHUB_API_KEY is not set.";
var AppSetting = {
    port: process.env.PORT || 3000,
    github: {
        username: "cpsc310bot",
        token: process.env.GITHUB_API_KEY
    },
    requestLimit: {
        maxCount: process.env.MAX_REQUESTS || 10,
        minDelay: process.env.MIN_REQUEST_DELAY || 4320
    },
    cmd: {
        concurrency: process.env.WORKERS || 1,
        timeout: process.env.CMD_TIMEOUT || 500000,
        file: process.env.CMD_SCRIPT || "app.sh",
    },
    cache: {
        port: process.env.REDIS_PORT || 6379,
        address: process.env.REDIS_ADDR || 'cache' || '127.0.0.1'
    },
    dbServer: {
        port: process.env.DB_PORT || 5984,
        address: process.env.DB_ADDR || 'db' || '127.0.0.1',
        connection: url.format({
            protocol: 'http',
            hostname: process.env.DB_ADDR || 'db' || '127.0.0.1',
            port: process.env.DB_PORT || 5984
        }),
        username: process.env.DB_DATA_USERNAME || "app",
        password: process.env.DB_DATA_PASSWORD || ""
    }
};
var router = Router();
var requestQueue = Queue("CPSC310 Submission Queue", AppSetting.cache.port, AppSetting.cache.address);
var nano = require("nano")(AppSetting.dbServer.connection);
function dbAuth(dbServer, callback) {
    nano.auth(dbServer.username, dbServer.password, function (err, body, headers) {
        var auth;
        if (err) {
            throw 'Failed to login to database. ' + err;
        }
        if (headers && headers['set-cookie']) {
            auth = headers['set-cookie'][0];
        }
        callback(require("nano")({ url: dbServer.connection + "/cpsc310", cookie: auth }));
    });
}
function getLatestRun(team, user, callback) {
    var viewParams = {
        key: team + "/" + user,
        group: true
    };
    dbAuth(AppSetting.dbServer, function (db) {
        db.view("default", "latest_run", viewParams, function (err, body) {
            callback(body && body[0] || 0);
        });
    });
}
var server = http.createServer(function (req, res) {
    router(req, res, finalhandler(req, res));
}).listen(AppSetting.port);
var deliverableHandler = Router();
router.use("/deliverable", deliverableHandler);
deliverableHandler.use(bodyParser.json());
deliverableHandler.post("/", function (req, res) {
    if (req.headers['token'] === AppSetting.github.token) {
        res.writeHead(200);
        deliverables = req.body;
    }
    else
        res.writeHead(403);
    res.end();
});
var submitHandler = Router();
router.use("/submit", submitHandler);
submitHandler.use(bodyParser.json());
submitHandler.post("/", function (req, res) {
    console.log("Submit was POSTed to!");
    var comment = req.body.comment.body.toLowerCase();
    var team = req.body.repository.name;
    var user = req.body.repository.owner.login;
    var postComment;
    if (comment.includes("@cpsc310bot")) {
        getLatestRun(team, user, function (latestRun) {
            var runDiff = Date.now() - latestRun - AppSetting.requestLimit.minDelay;
            if (runDiff > 0) {
                postComment = "Request received; should be processed within 2 minutes.";
                var deliverable = extractDeliverable(comment) || deliverables["current"];
                var testRepoURL = deliverables[deliverables["current"]].private;
                var submission = void 0;
                if (deliverable < deliverables["current"]) {
                    testRepoURL = deliverables[deliverable].private;
                    postComment += "\nInfo: Running specs for previous deliverable " + deliverable + ".";
                }
                else if (deliverable > deliverables["current"]) {
                    postComment += "\nWarn: Invalid deliverable specified, using latest.";
                }
                submission = {
                    username: req.body.comment.user.login,
                    reponame: req.body.repository.name,
                    repoURL: req.body.repository.html_url.replace("//", "//" + AppSetting.github.username + ":" + AppSetting.github.token + "@"),
                    commentURL: req.body.repository.commits_url.replace("{/sha}", "/" + req.body.comment.commit_id) + "/comments",
                    commitSHA: req.body.comment.commit_id,
                    testRepoURL: testRepoURL.replace("//", "//" + AppSetting.github.username + ":" + AppSetting.github.token + "@"),
                    deliverable: deliverable
                };
                requestQueue.add(submission);
            }
            else {
                postComment = "Request cannot be processed. Rate limit exceeded; please wait " + -1 * runDiff + "ms before trying again.";
            }
        });
    }
    else {
    }
    commentGitHub(postComment);
    res.writeHead(200);
    res.end();
});
function extractDeliverable(comment) {
    var deliverable = null;
    var matches = /.*#[dD](\d{1,2}).*/i.exec(comment);
    if (matches) {
        deliverable = "d" + +matches[1];
    }
    return deliverable;
}
function commentGitHub(msg) {
    console.log(msg);
}
function formatResult(result) {
    return result;
}
requestQueue.process(AppSetting.cmd.concurrency, function (job, done) {
    var submission = job.data;
    var file = ('./' + AppSetting.cmd.file).replace('//', '/');
    var args = [submission.testRepoURL, submission.repoURL, submission.commitSHA];
    var options = {
        maxBuffer: 500 * 1024
    };
    execFile(file, args, options, function (error, stdout, stderr) {
        if (error !== null)
            done(Error('Exec failed to run cmd. ' + error));
        else
            done(null, { stdout: stdout, stderr: stderr });
    });
});
requestQueue.on('active', function (job, jobPromise) {
    console.log("Active");
    var pr = job.data;
});
requestQueue.on('completed', function (job, result) {
    console.log("Completed");
    console.log(result);
    var submission = job.data;
    var doc = {
        team: submission.reponame,
        user: submission.username,
        result: result,
        output: formatResult(result),
        deliverable: submission.deliverable,
        commit: submission.commitSHA,
        timestamp: Date.now()
    };
    dbAuth(AppSetting.dbServer, function (db) {
        db.insert(doc, function (err, body) {
        });
    });
});
requestQueue.on('failed', function (job, error) {
    console.log("Failed");
    console.log(error);
    var pr = job.data;
});
//# sourceMappingURL=app.js.map