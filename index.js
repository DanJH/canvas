const express = require('express');
const app = express();
const http = require('http').Server(app);
const io = require('socket.io')(http);
const port = process.env.PORT || 3000;

app.use(express.static(__dirname + '/public'));

io.on('connection', function(socket) {
  socket.on('instantiateObj', function(data) {
    io.emit('instantiateObj', data);
  });

  socket.on('clearBoard', function(data) {
    io.emit('clearBoard', data);
  });

  socket.on('chatMessage', function(data) {
    io.emit('chatMessage', data);
  });
});

http.listen(port, () => console.log('Listening on port ' + port));
