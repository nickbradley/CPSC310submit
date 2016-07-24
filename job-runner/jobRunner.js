/**
 * @author Nick Bradley <nbrad11@cs.ubc.ca>
 * @summary
 * @description
 * @version
 */

// Get environment variables
var REDIS_PORT = process.env.REDIS_PORT || 6379;
var REDIS_ADDR = process.env.REDIS_ADDR || 'redis' || '127.0.0.1';
var WORKERS = process.env.WORKERS || 1;

var CMD_PATH = 'execTest.sh';
var TEST_REPO_URL = 'https://github.com/nickbradley/cpsc310-tester.git';
var CMD_TIMEOUT = 5000; // milliseconds


var Queue = require('bull');
var cluster = require('cluster');
var execFile = require('child_process').execFile;





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
  });
  jobQueue.on('completed', function(job, result) {
    var repoTests = result.repoTests;
    var abbrvResults = testResultsFormatter(result.stdout);

    repoTests.last_run = new Date();
    repoTests.num_runs++;
    repoTests.results.push(result.stdout);
    repoTests.abbrv_results.push(abbrvResults);

    msgQueue.add({status: 'completed', log: result.log, repoTests: repoTests});
  });

  jobQueue.on('failed', function(job, error) {
    msgQueue.add({status:'failed', log: job.data.log, error: error});
  });

  // Execute a job from the queue
  jobQueue.process(function(opts, done) {
    var result;
    var log = opts.data.log;
    var repoTests = opts.data.repoTests;
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

    execFile(cmd, [testRepoUrl, srcRepoUrl], execOpts, function(error, stdout, stderr) {
      if (error !== null) {
        done(Error('Exec failed to run cmd.'));
      }
      else {
        done(null, { stdout: stdout, stderr: stderr, log: log, repoTests: repoTests });
      }
    });
  });
}
