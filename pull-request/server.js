var Queue = require('bull');

// 'redis' should be defined in /etc/hosts by Docker
var jobQueue = Queue('CPSC310 Test Job Queue', '6379', 'redis');

jobQueue.process(function(opts, done){
  console.log(opts);
});

jobQueue.add("****////HELLO////****");

console.log(process.env);
