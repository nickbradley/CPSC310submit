var Queue = require('bull');
var cluster = require('cluster');
var execFile = require('child_process').execFile;


var REDIS_PORT = 6379;
var REDIS_ADDR = 'redis' || '127.0.0.1';
var WORKERS = 1;//config.jobs.count || 1;

var CMD_PATH = 'execTest.sh';
var TEST_REPO_URL = '';
var CMD_TIMEOUT = 5000; // milliseconds


var jobQueue = Queue('CPSC310 Test Job Queue', REDIS_PORT, REDIS_ADDR);
var msgQueue = Queue('CPSC310 Test Results Queue', REDIS_PORT, REDIS_ADDR);


function testResultsFormatter(result) {
  // accepts the stdout from the docker command
  // returns a string that will be posted to GitHub
  return result;
}


if (cluster.isMaster) {
  for (var i = 0; i < WORKERS; i++) {
    cluster.fork();
  }

  cluster.on('online', function(worker){
    console.log('Job processor is online.');
  });
  cluster.on('exit', function(worker, code, signal){
    console.log('Worker ' + worker.process.pid + ' died.');
  });
}
else {

  jobQueue.on('active', function(job, jobPromise) {
    msgQueue.add({status: 'active', log: job.data.log});
    //console.log("Job active");
  });
  jobQueue.on('completed', function(job, result) {
    //console.log(result.repoTests.num_runs);

//    var repoTests = JSON.parse(JSON.stringify(result.repoTests));
    var repoTests = result.repoTests;
    var abbrvResults = testResultsFormatter(result.stdout);
    console.log(repoTests);
    repoTests.last_run = new Date();
    repoTests.num_runs++;
    repoTests.results.push(result.stdout);
    repoTests.abbrv_results.push(abbrvResults);
console.log(repoTests);
    msgQueue.add({status: 'completed', log: result.log, repoTests: repoTests});
    //console.log('job completed', result);
  });

  jobQueue.on('failed', function(job, error) {

    console.log('Job', job);
    console.log('Error', error);
    msgQueue.add({status:'failed', log: job.data.log, error: error});
    //console.log('Job had error', error);
  });

  // Execute a job from the queue
  jobQueue.process(function(opts, done) {
    var result;
    //var cmd = opts.data.cmd;
    var log = opts.data.log;
    var repoTests = opts.data.repoTests;
    //var cmd = 'execTest.sh';

    //console.log(repoTests);

    var cmd = ('./' + CMD_PATH).replace('//', '/');
    var srcRepoUrl = opts.data.log.url;
    var testRepoUrl = TEST_REPO_URL;
    var execOpts = {
      cwd: null,  // Current working directory
      env: null,  // Environment key-value pairs
      encoding: 'utf8',
      timeout: CMD_TIMEOUT,
      maxBuffer: 500*1024,  // 500 KB
    };


    if (!cmd) {
      done(Error('Parameter opts missing property data.cmd or data.payload.'));
}

console.log('Starting to process job');
    execFile(cmd, [srcRepoUrl, testRepoUrl], execOpts, function(error, stdout, stderr) {
      if (error !== null) {
        done(Error('Exec failed to run cmd.'));
      }
      else {
        console.log(stdout);
        done(null, { stdout: stdout, stderr: stderr, log: log, repoTests: repoTests });
        }
        console.log("job done");

    });

    /*
    if (cmd && payload) {
      console.log('Processing cmd: ' + cmd);
      var child = exec(cmd, function (error, stdout, stderr) {
        if (error !== null) {
          result = {
            "successful": false,
            "stdout": stdout,
            "stderr": stderr,
            "error": error
          };
        }
        else {
          result = {
            "successful": true,
            "stdout": stdout,
            "stderr": stderr,
            "error": ""
          };
        }

        opts.data.result = result;
        msgQueue.add(opts.data);
      });  // exec
    }
    else {
      opts.data.result = {
        "successful": false,
        "stdout": "",
        "stderr": "",
        "error": "Parameter opts missing property data.cmd or data.payload."
      };
      msgQueue.add(opts.data);
    }
    */
    //done();
  });
}
