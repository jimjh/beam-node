/**
 * Web server - nodester entry point
 * @author Jiunn Haur Lim
 */

var express = require('express');
var http = require('http');
var app = express.createServer();
var endpoint = require('./endpoint.js').listen(app);

//---------------------------------------------------------------------
// App bootstrapping
//---------------------------------------------------------------------

// nodester port
var port = 13359;
app.listen(port, function(){
  console.log('Listening on port ' + port);
});

app.configure('development', function(){
  app.use(express.errorHandler({ dumpExceptions: true, showStack: true })); 
});

app.configure('production', function(){
  app.use(express.errorHandler()); 
});

// reply with "Hello, World!" for every request
app.get('/', function (req, res) {
  res.send('Hello, World!');
});

// on notification from file server, tell endpoints
app.get('/transfer/:uuid', function(req, res) {
  // TODO: error handling and validation
  endpoint.transfer(req.params.uuid,
                    req.query.bucket,
                    req.query.key);
  res.send('Hello, World!');
});
