/**
 * Endpoint Module
 * - Registers endpoint UUID for each connected client
 * - Notifies app server when a client is disconnected
 * - Notifies target endpoint of pending file transfer
 * @author Jiunn Haur Lim
 */
 
var http = require('http');
var socketio = require('socket.io');
var io = null;

//--- Events ---
const EVT_SET_UUID = 'set uuid';

//--- Data Keys ---
const KEY_UUID = 'uuid';

const APP_HOST = 'afternoon-fire-7441.heroku.com';
const APP_PORT = 80;

// const APP_HOST = 'localhost';
// const APP_PORT = '3000';

//---------------------------------------------------------------------
// PRIVATE
//---------------------------------------------------------------------
 
/**
 * Unregisters an endpoint with the given UUID from the app server.
 * @param uuid      UUID of endpoint to unregister
 */
var unregister = function (uuid){
  
  var user = 'codex';
  var pwd = 'abc';
  var auth = 'Basic ' + new Buffer(user + ':' + pwd).toString('base64');

  var http_headers = {
    'Authorization' : auth,
    'Content-Length' : 0
  };

  // DELETE /endpoints/<uuid> HTTP/1.1
  var http_options = {
    host: APP_HOST,
    hostname: APP_HOST,
    port: APP_PORT,
    method: 'DELETE',
    path: '/endpoints/' + uuid + '/deactivate',
    headers : http_headers
  };

  // invoked on response from app server
  var response_callback = function (res){
    console.log('Status from app server: ' + res.statusCode);
  };
  // TODOOOOOOOO: where to put the data? content-length?
  // invoked on connection error
  var error_handler = function (e){
    console.log('Problem with request: ' + e.message);
  };

  // fire http request
  var req =  http.request(http_options, response_callback);
  req.on('error', error_handler);
  req.end();

};

/**
 * Registers UUID for an endpoint and listens for the 'disconnect' event.
 * @param socket      from socket.io 'connection' event
 * @param uuid        UUID of endpoint to register
 */
var register = function (socket, uuid){
  
  // set endpoint UUID for this session
  socket.set(KEY_UUID, uuid);
  
  // create a room for this endpoint
  socket.join(uuid);

  // on disconnect, tell app server
  socket.on('disconnect', function () {
    socket.get(KEY_UUID, function (err, uuid) {
      console.log ('Disconnect received from ' + uuid);
      unregister(uuid);
    });
  });

};

//---------------------------------------------------------------------
// PUBLIC
//---------------------------------------------------------------------

exports.listen = function(app){
  
  io = socketio.listen(app);

  // listen for incoming connections
  io.sockets.on('connection', function (socket) {
    // listen for "set_uuid" event, then register endpoint
    socket.on(EVT_SET_UUID, function (uuid) {
      register(socket, uuid);
    });
  });
  
}

exports.transfer = function (uuid){
  io.sockets.in(uuid).send('Man, good to see you back!');
}