/**
 * Web Socket server
 * * Registers endpoint UUID for each connected client
 * * Notifies app server when a client is disconnected
 * @author Jiunn Haur Lim
 */

var app = require('express').createServer();
var http = require('http');
var io = require('socket.io').listen(app);

//-------------------------------------------------
// App bootstrapping
//-------------------------------------------------

// copied from heroku example
var port = process.env.PORT || 3000;
app.listen(port, function(){
  console.log('Listening on port ' + port);
});

// reply with "Hello, World!" for every request
app.get('/', function (req, res) {
  res.send('Hello, World!');
});

//-------------------------------------------------
// Socket.IO setup
//-------------------------------------------------

var KEY_UUID = 'uuid';
var EVT_SET_UUID = 'set uuid';
var APP_HOST = 'afternoon-fire-7441.heroku.com';

/* 
 * heroku doesn't support websockets yet, so we
 * fall back to polling
 */
io.configure(function () { 
  io.set("transports", ["xhr-polling"]); 
  io.set("polling duration", 10); 
});

/**
 * Unregisters an endpoint with the given UUID from the
 * app server.
 * @param uuid      UUID of endpoint to unregister
 */
var unregister_endpoint = function (uuid){

  // DELETE /endpoints/<uuid> HTTP/1.1
  var http_options = {
    host: APP_HOST,
    hostname: APP_HOST,
    method: 'DELETE',
    path: '/endpoints/' + uuid,
    headers : {'Content-Length' : 0},
    auth: "codex:abc"
  };

  // invoked on response from app server
  var response_callback = function (res){
    console.log('Status from app server: ' + res.statusCode);
  };

  // invoked on connection error
  var error_handler = function (e){
    console.log ('Problem with request: ' + e.message);
  };

  // fire http request
  var req =  http.request(http_options, response_callback);
  req.on('error', error_handler);
  req.end();

};

/**
 * Registers UUID for an endpoint and listens for the
 * 'disconnect' event.
 * @param socket
 * @param uuid        UUID of endpoint to register
 */
var register_endpoint = function (socket, uuid){
  
  // set endpoint UUID for this session
  socket.set(KEY_UUID, uuid);

  // on disconnect, tell app server
  socket.on('disconnect', function () {
    console.log ("Disconnect received.");
    socket.get(KEY_UUID, function (err, uuid) {
      unregister_endpoint(uuid);
    });
  });

};

// listen for incoming connections
io.sockets.on('connection', function (socket) {
  // listen for "set_uuid" event
  socket.on(EVT_SET_UUID, function (uuid) {
    register_endpoint(socket, uuid);
  });
});
