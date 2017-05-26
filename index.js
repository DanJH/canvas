var app = require('express')();
var http = require('http').Server(app);
io = require('socket.io')(http);

app.get('/', function(req, res){
res.sendFile(__dirname + '/client/index.html');
});

http.listen(3000, function(){
  console.log('listening on *:3000');
});
    