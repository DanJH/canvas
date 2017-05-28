const express = require("express");
const app = express();
const http = require("http").Server(app);
const io = require("socket.io")(http);
const port = process.env.PORT || 3000;

var server = {
    users: [],
    board: []
};

app.use(express.static(__dirname + "/public"));
io.on("connection", function(socket) {
    //console.log(socket.handshake.address + " connected.")

    server.users.push({
        id: socket.id
    })

    // Send connecting user the board
    socket.emit("userInit", server.board);

    socket.on("createObj", function(data) {
        server.board.push(data);
        io.emit("createObj", data);
    });

    socket.on("clearOwnBoard", function(owner) {
        for (var i in server.board) {
            if (server.board[i].owner == owner) {
                server.board.splice(i, 1);
            }
        }
        io.emit("clearOwnBoard", owner);
    });

    socket.on("clearBoard", function(data) {
        server.board = [];
        io.emit("clearBoard", data);
    });

    socket.on("chatMessage", function(data) {
        io.emit("chatMessage", data);
    });

    socket.on("disconnect", function() {
        //console.log(socket.handshake.address + " disconnected.");

        for (var i in server.users) {
            if (server.users[i].id == socket.id) {
                server.users.splice(i, 1);
                //io.emit("serverData", server);
            }
        }
    });
});

http.listen(port, () => console.log("Listening on port " + port));
