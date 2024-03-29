/**
 * Endpoint Module
 * - Registers endpoint UUID for each connected client
 * - Notifies app server when a client is disconnected
 * - Notifies target endpoint of pending file transfer
 * @author Jiunn Haur Lim
 */
 
var http = require('http');
var S3 = require('./s3.js').S3;

var socketio = require('socket.io');
var io = null;

//--- Events ---
const EVT_SET_UUID = 'set uuid';
const EVT_GET_FILE = 'get file';
const EVT_NEIGHBOR_ARRIVED = 'neighbor arrived';
const EVT_NEIGHBOR_LEFT =  'neighbor left';

//--- Data Keys ---
const KEY_UUID = 'uuid';

//--- Other Constants ---

/** @const suffix for Amazon S3 virtual host */
const HOST_SUFFIX = '.s3.amazonaws.com';

const APP_HOST = process.env.BEAM_APP_HOST;
const APP_PORT = process.env.BEAM_APP_PORT;
const S3_KEY = process.env.S3_KEY;
const S3_SECRET = process.env.S3_SECRET;

const s3 = new S3(S3_KEY, S3_SECRET);

//---------------------------------------------------------------------
// PRIVATE
//---------------------------------------------------------------------
 
/**
 * Unregisters an endpoint with the given UUID from the app server.
 * @param socket           from socket.io 'disconnect' event
 * @param {UUID} uuid      UUID of endpoint to unregister
 */
var unregister = function (socket, uuid){

  if (!uuid || !socket){
    console.warn ('Missing parameters in register.');
    return;
  }
  
  var user = 'codex';
  var pwd = 'abc';
  var auth = 'Basic ' + new Buffer(user + ':' + pwd).toString('base64');

  var http_headers = {
    'Authorization' : auth,
    'Content-Length' : 0
  };

  // DELETE /endpoints/<uuid>/deactivate HTTP/1.1
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

  // invoked on connection error
  var error_handler = function (e){
    console.log('Problem with request: ' + e.message);
  };

  // fire http request
  var req =  http.request(http_options, response_callback);
  req.on('error', error_handler);
  req.end();
  
  // tell everyone that he left
  socket.broadcast.emit(EVT_NEIGHBOR_LEFT, {id: uuid});

};

/**
 * Registers UUID for an endpoint and listens for the 'disconnect' event.
 * @param socket      from socket.io 'connection' event
 * @param uuid        UUID of endpoint to register
 */
var register = function (socket, uuid){

  if (!socket || !uuid){
    console.warn ('Missing parameters in register.');
    return;
  }
  
  // set endpoint UUID for this session
  socket.set(KEY_UUID, uuid);
  
  // create a room for this endpoint
  socket.join(uuid);
  
  // tell everyone that he is here!
  socket.broadcast.json.emit(EVT_NEIGHBOR_ARRIVED, {id: uuid});

  // on disconnect, tell app server
  socket.on('disconnect', function () {
    socket.get(KEY_UUID, function (err, uuid) {
      console.log ('Disconnect received from ' + uuid);
      unregister(socket, uuid);
    });
  });

};

//---------------------------------------------------------------------
// PUBLIC
//---------------------------------------------------------------------

exports.listen = function(app){
  
  if(!app) throw new Error('Missing app.');
  
  io = socketio.listen(app);

  // listen for incoming connections
  io.sockets.on('connection', function (socket) {
    // listen for "set_uuid" event, then register endpoint
    socket.on(EVT_SET_UUID, function (uuid) {
      register(socket, uuid);
    });
  });
  
  return exports;
  
}

/**
 * Notifies target endpoint to download the specified file from the specified
 * bucket.
 * @param {String}    ID of target endpoint
 * @param {String}    Name of Amazon S3 bucket
 * @param {String}    Name of file to download
 */
exports.transfer = function (target_id, bucketName, fileName){

  if (!target_id || !bucketName || !fileName)
    throw new Error('Missing parameters.');

  var host = bucketName + HOST_SUFFIX;
  var queryStr = s3.getQueryString(host, bucketName, fileName);
  io.sockets.in(target_id).emit(EVT_GET_FILE, queryStr);
  
}