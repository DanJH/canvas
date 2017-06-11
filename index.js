const express = require("express");
const app = express();
const http = require("http").Server(app);
const io = require("socket.io")(http);
const port = process.env.PORT || 3000;

var game = {
    users: [],
    board: []
};

// TODO: thickness tweak

app.use(express.static(__dirname + "/public"));
io.on("connection", function(socket) {
    //console.log(socket.handshake.address + " connected.")

    game.users.push({
        id: socket.id
    })
    socket.emit("clearBoard", "Server", true);

    // Send connecting user existing board
    socket.emit("userInit", game.board);

    socket.on("draw", function(data) {
        game.board.push(data);
        io.emit("draw", data);
    });

    socket.on("clearOwnBoard", function(user) {
        game.board = game.board.filter(function(value, index, array) {
            return (value.owner != user);
        });
        io.emit("clearOwnBoard", user);
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

        for (var i in game.users) {
            if (game.users[i].id == socket.id) {
                game.users.splice(i, 1);
                //io.emit("serverData", server);
            }
        }
    });
});

http.listen(port, () => console.log("Listening on port " + port));
