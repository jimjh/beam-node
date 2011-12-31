/**
 * Web Socket server
 */

//-------------------------------------------------
// App bootstrapping
//-------------------------------------------------
var app = require('express').createServer()
  , http = require('http')
  , io = require('socket.io').listen(app);

var port = process.env.PORT || 3000;
app.listen(port, function(){
  console.log("Listening on port " + port);
});

app.get('/', function (req, res) {
  res.send("Hello, World!");
});

//------------------------------------------------
// Socket.IO setup
//------------------------------------------------

var KEY_UUID = 'uuid';
var EVT_SET_UUID = 'set uuid';
var APP_HOST = "afternoon-fire-7441.heroku.com";

/* 
 * heroku doesn't support websockets yet, so we
 * fall back to polling
 */
io.configure(function () { 
  io.set("transports", ["xhr-polling"]); 
  io.set("polling duration", 10); 
});

var unregister_endpoint = function (uuid){

  var req =  http.request({
    host: APP_HOST,
    hostname: APP_HOST,
    method: 'DELETE',
    path: '/endpoints/' + uuid
  }, function(res){
    console.log('STATUS: ' + res.statusCode);
    console.log('HEADERS: ' + JSON.stringify(res.headers));
    res.setEncoding('utf8');
    res.on('data', function (chunk) {
      console.log('BODY: ' + chunk);
    });
  });

  req.on('error', function(e){
    console.log('Problem with request: ' + e.message);
  });

  req.end();

}

io.sockets.on('connection', function (socket) {

  // set endpoint UUID for this session
  socket.on(EVT_SET_UUID, function (uuid) {
    socket.set(KEY_UUID, uuid);
  });

  // on disconnect, tell app server
  socket.on('disconnect', function () {
    console.log ("disconnect received.");
    socket.get(KEY_UUID, function (err, uuid) {
      unregister_endpoint(uuid);
    });
  });

});
