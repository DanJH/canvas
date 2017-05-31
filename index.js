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
    socket.emit("clearBoard", "Server", true);

    // Send connecting user the board
    socket.emit("userInit", server.board);

    socket.on("createObj", function(data) {
        server.board.push(data);
        io.emit("createObj", data);
    });

    socket.on("clearOwnBoard", function(user) {
        server.board = server.board.filter(function(value, index, array) {
            return (value.owner != user);
        });
        io.emit("clearOwnBoard", user);
    });

    socket.on("clearBoard", function(user) {
        server.board = [];
        io.emit("clearBoard", user);
    });

    socket.on("gameStart"), function(user) {
        io.emit("gameStart", user);
    }

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
