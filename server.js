/**
 * Web Socket server
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
var port = 13359;
app.listen(port, function(){
  console.log('Listening on port ' + port);
});

// reply with "Hello, World!" for every request
app.get('/', function (req, res) {
  res.send('Hello, World!');
});

//---------------------------------------------------------------------
// Socket.IO setup
//---------------------------------------------------------------------

var EVT_SET_UUID = 'set uuid';

/* 
 * heroku doesn't support websockets yet, so we
 * fall back to polling
 */
io.configure(function () { 
  io.set("transports", ["xhr-polling"]); 
  io.set("polling duration", 10); 
});

// listen for incoming connections
io.sockets.on('connection', function (socket) {
  // listen for "set_uuid" event, then register endpoint
  socket.on(EVT_SET_UUID, function (uuid) {
    endpoint.register(socket, uuid);
  });
});
