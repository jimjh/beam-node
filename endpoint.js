/**
 * - Registers endpoint UUID for each connected client
 * - Notifies app server when a client is disconnected
 * @author Jiunn Haur Lim
 */
 
var http = require('http');
 
var KEY_UUID = 'uuid';
var APP_HOST = 'afternoon-fire-7441.heroku.com';
 
/**
 * Unregisters an endpoint with the given UUID from the
 * app server.
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
    method: 'DELETE',
    path: '/endpoints/' + uuid,
    headers : http_headers
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
exports.register = function (socket, uuid){
  
  // set endpoint UUID for this session
  socket.set(KEY_UUID, uuid);

  // on disconnect, tell app server
  socket.on('disconnect', function () {
    console.log ("Disconnect received.");
    socket.get(KEY_UUID, function (err, uuid) {
      unregister(uuid);
    });
  });

};