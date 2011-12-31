var app = require('express').createServer()
  , io = require('socket.io').listen(app);

var port = process.env.PORT || 3000;
app.listen(port, function(){
  console.log("Listening on port " + port);
});

app.get('/', function (req, res) {
  res.send("Hello, World!");
});

io.configure(function () { 
  io.set("transports", ["xhr-polling"]); 
  io.set("polling duration", 10); 
});

io.sockets.on('connection', function (socket) {
  socket.on('set uuid', function (uuid) {
    console.log(uuid);
  });
});
