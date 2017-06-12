const express = require("express");
const app = express();
const http = require("http").Server(app);
const io = require("socket.io")(http);
const port = process.env.PORT || 3000;

var game = {
    board: []
};

app.use(express.static(__dirname + "/public"));
http.listen(port, () => console.log("Listening on port " + port));

io.on("connection", function(socket) {
    //console.log(socket.handshake.address + " connected.")

    // Clear board for any existing users
    socket.emit("clearBoard", "Server", true);

    // Send connecting user existing board
    socket.emit("userInit", game.board);

    socket.on("draw", function(data) {
        game.board.push(data);
        io.emit("draw", data);
    });

    socket.on("clearBoard", function(user) {
        game.board = [];
        io.emit("clearBoard", user);
    });

    socket.on("chatMessage", function(data) {
        io.emit("chatMessage", data);
    });

    socket.on("disconnect", function() {
        //console.log(socket.handshake.address + " disconnected.");
    });
});