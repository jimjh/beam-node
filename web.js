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

io.sockets.on('connection', function (socket) {
  // set endpoint UUID for this session
  socket.on(EVT_SET_UUID, function (uuid) {
    socket.set(KEY_UUID, uuid);
  });
  // on disconnect, tell app server
  socket.on('disconnect', function () {
    var req =  http.request({
      host: APP_HOST,
      method: 'DELETE',
      path: '/endpoints/' + socket.get(KEY_UUID),
      auth: 'codex:abc'
    }, function(res){
      console.log('STATUS: ' + res.statusCode);
    });
    req.end();
  });
});
