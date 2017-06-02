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
    console.log(socket.id, "connected");

    server.users.push({
        id: socket.id
    })
    socket.emit("clearBoard", "Server", true);

    // Send connecting socket.id the board
    socket.emit("socket.idInit", server.board);

    socket.on("createObj", function(data) {
        server.board.push(data);
        io.emit("createObj", data);
    });

    socket.on("gameStart", function() {
        io.emit("gameStart");  
    });

    socket.on("clearOwnBoard", function() {
        server.board = server.board.filter(function(value, index, array) {
            return (value.owner != socket.id);
        });
        io.emit("clearOwnBoard", socket.id);
    });

    socket.on("clearBoard", function() {
        server.board = [];
        io.emit("clearBoard", socket.id);
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
