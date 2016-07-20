var https = require('https');
var fs = require('fs')
var Queue = require('bull');

// 'redis' should be defined in /etc/hosts by Docker
var jobQueue = Queue('CPSC310 Test Job Queue', '6379', 'redis');

jobQueue.process(function(opts, done){
  console.log(opts);
});

jobQueue.add("****////HELLO////****");

try {
  var httpsOptions = {
    "key": fs.readFileSync('/app/cpsc310-2016Fall.key'),
    "cert": fs.readFileSync('/app/cpsc310-2016Fall.crt')
  };
}
catch (ex) {
  throw 'SSL certificate or key is missing or not accessible.';
}

https.createServer(httpsOptions, (req, res) => {
  console.log('I got a request.');
  res.writeHead(200, { 'Content-Type': 'text/plain'});
  res.end();
}).listen('4430');
