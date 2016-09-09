var finalhandler = require("finalhandler");
var http = require("http");
var https = require("https");
var Router = require("router");
var url = require("url");
var bodyParser = require("body-parser");
var Queue = require("bull");
var execFile = require("child_process").execFile;
var winston = require("winston");
var winstonCouch = require("winston-couchdb").Couchdb;
var moment = require("moment");
if (!process.env.GITHUB_API_KEY)
    throw "Required environment variable GITHUB_API_KEY is not set.";
var AppSetting = {
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
        timeout: process.env.CMD_TIMEOUT || 120000,
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
var logger = new (winston.Logger)({
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
var router = Router();
var requestQueue = Queue("CPSC310 Submission Queue", AppSetting.cache.port, AppSetting.cache.address);
var nano = require("nano")(AppSetting.dbServer.connection);
var deliverables;
var users;
dbAuth(AppSetting.dbServer, function (db) {
    db.get("deliverables", function (error, body) {
        if (error) {
            console.log("Warning: failed to retreive deliverables document from database.");
        }
        deliverables = {
            current: "d1",
            d1: { public: "", private: "https://github.com/CS310-2016Fall/cpsc310d1-priv.git" },
            d2: { public: "", private: "" }
        };
    });
    db.get("users", function (error, body) {
        if (error) {
            console.log("Warning: failed to retreive users document from database.");
        }
        users = ["cpsc310project_team1/nickbradley", "cpsc310project/nickbradley"];
    });
});
var queuedOrActive = [];
function dbAuth(dbServer, callback) {
    nano.auth(dbServer.username, dbServer.password, function (err, body, headers) {
        var auth;
        if (err) {
            throw "Failed to login to database. " + err;
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
            if (err) {
                callback(0);
            }
            else {
                callback(body.rows[0] && body.rows[0].value || 0);
            }
        });
    });
}
function extractDeliverable(comment) {
    var deliverable = null;
    var matches = /.*#[dD](\d{1,2}).*/i.exec(comment);
    if (matches) {
        deliverable = "d" + +matches[1];
    }
    return deliverable;
}
function commentGitHub(submission, msg) {
    if (submission.commentURL) {
        console.log("**** " + msg + " ****");
    }
}
function formatResult(result) {
    var passMatches = /^.*(\d+) passing.*$/m.exec(result);
    var failMatches = /^.*(\d+) failing.*$/m.exec(result);
    var passes = 0;
    var fails = 0;
    var firstFailTestName = "";
    if (passMatches)
        passes = +passMatches[1];
    if (failMatches) {
        fails = +failMatches[1];
        var matches = /^.*1\) (.+)$/m.exec(result);
        if (matches)
            firstFailTestName = matches[1];
    }
    if (passes == 0 && fails == 0)
        return "Invalid Mocha output.";
    else if (fails == 0)
        return passes + " passing, " + fails + " failing";
    else
        return passes + " passing, " + fails + " failing" + "\nName of first spec to fail: " + firstFailTestName;
}
function isEmpty(obj) {
    for (var key in obj) {
        if (obj.hasOwnProperty(key))
            return false;
    }
    return true;
}
var deliverableHandler = Router();
router.use("/deliverables", deliverableHandler);
deliverableHandler.use(bodyParser.json());
deliverableHandler.post("/", function (req, res) {
    if (req.headers['token'] === AppSetting.github.token) {
        var doc = req.body;
        if (isEmpty(doc))
            logger.warn("Empty deliverables document received.");
        dbAuth(AppSetting.dbServer, function (db) {
            db.get("deliverables", function (error, body) {
                doc._id = "deliverables";
                if (!error) {
                    doc._rev = body._rev;
                }
                db.insert(doc, function (error, body) {
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
var usersHandler = Router();
router.use("/users", usersHandler);
usersHandler.use(bodyParser.json());
usersHandler.post("/", function (req, res) {
    if (req.headers['token'] === AppSetting.github.token) {
        var doc = req.body;
        if (isEmpty(doc))
            logger.warn("Empty deliverables document received.");
        dbAuth(AppSetting.dbServer, function (db) {
            db.get("users", function (error, body) {
                doc._id = "users";
                if (!error) {
                    doc._rev = body._rev;
                }
                db.insert(doc, function (error, body) {
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
var gradeHandler = Router();
router.use("/grade", gradeHandler);
gradeHandler.use(bodyParser.urlencoded());
gradeHandler.get("/:delv", function (req, res) {
    var delv = req.params["delv"];
    console.log(req.params);
    console.log("delv", delv);
    if (req.headers['token'] === AppSetting.github.token) {
        if (deliverables.hasOwnProperty(delv)) {
            res.writeHead(200);
            res.end();
        }
        else {
            res.writeHead();
            res.end("Invalid deliverable specified.");
        }
    }
    else {
        res.writeHead(403);
        res.end();
    }
});
var submitHandler = Router();
router.use("/submit", submitHandler);
submitHandler.use(bodyParser.json());
submitHandler.post("/", function (req, res) {
    console.log("Submit was POSTed to!");
    var comment = req.body.comment.body.toLowerCase();
    var team = req.body.repository.name;
    var user = req.body.comment.user.login;
    var postComment;
    var submission;
    var testRepoURL;
    var deliverable;
    var msgInfo = "";
    if (comment.includes("@cpsc310bot")) {
        deliverable = extractDeliverable(comment);
        if (!deliverable) {
            msgInfo = "\nNote: No deliverable specified, using latest.";
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
            repoURL: req.body.repository.html_url.replace("//", "//" + AppSetting.github.username + ":" + AppSetting.github.token + "@"),
            commentURL: req.body.repository.commits_url.replace("{/sha}", "/" + req.body.comment.commit_id) + "/comments",
            commitSHA: req.body.comment.commit_id,
            testRepoURL: testRepoURL.replace("//", "//" + AppSetting.github.username + ":" + AppSetting.github.token + "@"),
            deliverable: deliverable
        };
        var jobId_1 = submission.reponame + "/" + submission.username;
        if (users.includes(team + "/" + user)) {
            if (!queuedOrActive.includes(jobId_1)) {
                getLatestRun(team, user, function (latestRun) {
                    var runDiff = Date.now() - latestRun - AppSetting.requestLimit.minDelay;
                    if (runDiff > 0) {
                        queuedOrActive.push(jobId_1);
                        requestQueue.add(submission, { jobId: jobId_1 });
                        requestQueue.count().then(function (queueLength) {
                            logger.info("Request received for " + submission.reponame + "/" + submission.username + " commit " + submission.commitSHA, submission);
                            commentGitHub(submission, "Request received; should be processed within " + (queueLength * 2 + 2) + " minutes." + msgInfo);
                        });
                    }
                    else {
                        logger.info("Rate limit exceeded for " + submission.reponame + "/" + submission.username + " commit " + submission.commitSHA, submission);
                        commentGitHub(submission, "Request cannot be processed. Rate limit exceeded; please wait " + moment.duration(-1 * runDiff).humanize() + " before trying again.");
                    }
                });
            }
            else {
                logger.info("Request is already queued for " + submission.reponame + "/" + submission.username + " commit " + submission.commitSHA, submission);
                commentGitHub(submission, "Request is already queued for processing.");
            }
        }
        else {
            logger.info("User not registered for requests for " + submission.reponame + "/" + submission.username + " commit " + submission.commitSHA, submission);
            commentGitHub(submission, "Request cannot be processed; not registered.");
        }
    }
    else {
    }
    res.writeHead(200);
    res.end();
});
requestQueue.process(AppSetting.cmd.concurrency, function (job, done) {
    var submission = job.data;
    var file = ('./' + AppSetting.cmd.file).replace('//', '/');
    var args = [submission.testRepoURL, submission.repoURL, submission.commitSHA];
    var options = {
        timeout: AppSetting.cmd.timeout,
        maxBuffer: 500 * 1024
    };
    var exec = execFile(file, args, options, function (error, stdout, stderr) {
        if (error !== null)
            done(Error('Exec failed to run cmd. ' + error));
        else
            done(null, { stdout: stdout, stderr: stderr });
    });
});
requestQueue.on('active', function (job, jobPromise) {
    var submission = job.data;
    logger.info("Started running tests for " + submission.reponame + "/" + submission.username + " commit " + submission.commitSHA, submission);
});
requestQueue.on('completed', function (job, result) {
    var submission = job.data;
    var doc = {
        team: submission.reponame,
        user: submission.username,
        result: result,
        output: formatResult(result.stdout),
        deliverable: submission.deliverable,
        commit: submission.commitSHA,
        timestamp: Date.now()
    };
    queuedOrActive.splice(queuedOrActive.indexOf(job.opts.jobId), 1);
    dbAuth(AppSetting.dbServer, function (db) {
        db.insert(doc, function (error, body) {
            if (error) {
                logger.error("Inserting document failed for " + submission.reponame + "/" + submission.username + " commit " + submission.commitSHA, submission, error);
                commentGitHub(submission, 'Failed to execute tests.');
            }
            else {
                logger.info("Finished running tests for " + submission.reponame + "/" + submission.username + " commit " + submission.commitSHA, submission);
                commentGitHub(submission, doc.output);
            }
        });
    });
});
requestQueue.on('failed', function (job, error) {
    var submission = job.data;
    queuedOrActive.splice(queuedOrActive.indexOf(job.opts.jobId), 1);
    logger.error("Executing tests failed for " + submission.reponame + "/" + submission.username + " commit " + submission.commitSHA, submission, error);
    commentGitHub(submission, 'Failed to execute tests.');
});
var server = http.createServer(function (req, res) {
    router(req, res, finalhandler(req, res));
}).listen(AppSetting.port);
//# sourceMappingURL=app.js.map