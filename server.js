/**
 * Web Socket server
 * @author Jiunn Haur Lim
 */

var http = require('http');
var app = http.createServer(function (req, res) {
  res.writeHead(200, {'Content-Type': 'text/plain'});
  res.end('Hello World\nApp (codex) is running..');
});
var io = require('socket.io').listen(app);
var endpoint = require('./endpoint.js');

//---------------------------------------------------------------------
// App bootstrapping
//---------------------------------------------------------------------

// nodester port
var port = 13359;
app.listen(port, function(){
  console.log('Listening on port ' + port);
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
