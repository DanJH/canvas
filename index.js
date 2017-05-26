var app = require('express')();
var http = require('http').Server(app);
io = require('socket.io')(http);

 app.get(/^(.+)$/, function(req, res){ 
     res.sendfile( __dirname + "/public/" + req.params[0]); 
 });

http.listen(3000, function(){
  console.log('listening on *:3000');
});
    