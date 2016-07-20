var Queue = require('bull');

// 'redis' should be defined in /etc/hosts by Docker
var jobQueue = Queue('CPSC310 Test Job Queue', '6379', 'redis');


console.log(process.env);
