/**
 * Web server - nodester entry point
 * @author Jiunn Haur Lim
 */

var app = require('express').createServer();
var http = require('http');
var io = require('socket.io').listen(app);
var endpoint = require('./endpoint.js');

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
  console.log(req.params);
});

//---------------------------------------------------------------------
// Socket.IO setup
//---------------------------------------------------------------------

var EVT_SET_UUID = 'set uuid';

// listen for incoming connections
io.sockets.on('connection', function (socket) {
  // listen for "set_uuid" event, then register endpoint
  socket.on(EVT_SET_UUID, function (uuid) {
    endpoint.register(socket, uuid);
  });
});
