var https = require('https');
var fs = require('fs')
var Queue = require('bull');

// 'redis' should be defined in /etc/hosts by Docker
var jobQueue = Queue('CPSC310 Test Job Queue', '6379', 'redis');

jobQueue.process(function(opts, done){
  console.log(opts);
});

jobQueue.add("****////HELLO////****");

console.log(process.env);

try {
  var httpsOptions = {
    "key": fs.readFileSync(process.env.npm_package_config_cert_key_file),
    "cert": fs.readFileSync(process.env.npm_package_config_cert_cert_file)
  };
}
catch (ex) {
  throw 'SSL certificate or key is missing or not accessible.';
}

https.createServer(httpsOptions, (req, res) => {
  res.writeHead(200);
  res.end();
}).listen(PORT);
