/**
 * Web server - nodester entry point
 * @author Jiunn Haur Lim
 */

var app = require('express').createServer();
var http = require('http');
var endpoint = require('./endpoint.js').listen(app);

//---------------------------------------------------------------------
// App bootstrapping
//---------------------------------------------------------------------

// copied from heroku example
// var port = process.env.PORT || 3000;
// nodester port
var port = 13359;
app.listen(port, function(){
  console.log('Listening on port ' + port);
});

// reply with "Hello, World!" for every request
app.get('/', function (req, res) {
  res.send('Hello, World!');
});

// on notification from file server, tell endpoints
app.get('/transfer/:uuid', function(req, res) {
  // TODO: error handling and validation
  console.log (req);
  endpoint.transfer(req.params.uuid);
});
