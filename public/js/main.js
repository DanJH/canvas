var socket = io();
var canvas = document.getElementById("mainCanvas");
var ctx = canvas.getContext("2d");

var lastFrame;
var fps;

var board = [];
var mouse = {
    down: false,
    x: 0,
    y: 0
};

var player = {
    color: [randRange(40, 200), randRange(40, 200), randRange(40, 200)]
};

$("canvas").mousedown(function() {
    mouse.down = true;
    newObject();
});

$("canvas").mouseup(function() {
    mouse.down = false;
});

/* Scaling (pointless)
$(document).keypress(function(e) {
    if (e.key == "=") {
        ctx.scale(.95, .95);
    }

    if (e.key == "-") {
        ctx.scale(1.05, 1.05);
    }
});*/

// Send events
$("canvas").mousemove(function(e) {
    // Update the position of the mouse
    var rect = canvas.getBoundingClientRect();
    mouse.x = e.clientX - rect.left;
    mouse.y = e.clientY - rect.top;

    // Draw when dragging
    if (mouse.down) {
        newObject();
    }
});

$("#console input").on("keyup", function(e) {
    if (e.keyCode == 13) {
        socket.emit("chatMessage", {
            msg: $(this).val(),
            user: socket.id,
            color: player.color
        });
        $(this).val("");
    }
});

function newObject() {
    var obj = {
        pos: [mouse.x, mouse.y],
        size: 25,
        color: player.color,
        owner: socket.id,
    };

    obj.pos = [obj.pos[0] - obj.size/2, obj.pos[1] - obj.size/2];

    // Verify that there are no null properties
    /*for (var prop in obj) {
        if (!obj[prop]) {
            console.warn("Object has null values, ignoring");
            return;
        }
    }*/

    socket.emit("createObj", obj);
}

function clearOwnBoard() {
    socket.emit("clearOwnBoard", socket.id);
}

function clearBoard() {
    socket.emit("clearBoard", socket.id);
}

$("#apply").click(function() {
    console.log("Applying new settings")
    player.color = $("#color").val().split(",");
});

// Receive events
socket.on("connect", function() {
    console.log("User ID: " + socket.id);
});

socket.on("userInit", function(data) {
    console.log("Receiving data from server...");
    for (var i in data) {
        board.push(data[i]);
    }
    console.log("Fetched " + data.length + " indices");
});

socket.on("createObj", function(data) {
    board.push(data);
});

socket.on("clearOwnBoard", function(owner) {
    // TODO: only removes half of squares
    for (var i in board) {
        if (board[i].owner == owner) {
            board.splice(i, 1);
        }
    }
});

socket.on("clearBoard", function(data) {
    console.log(data + " cleared the board.");
    $("body").effect("shake");
    board = [];
});

socket.on("chatMessage", function(data) {
    $("#console ul").append('<li><span style="color: ' + toHexColor(data.color) + '">' + data.user.substring(0, 6) + '</span>' + data.msg + '</li>');
});

socket.on("serverData", function(data) {
    // Display object as ul
    $("ul").empty();
    
    $.each(data, function(i) {
        // TODO: more accurately represent the data
        var li = $('<li/>').appendTo($('#serverData ul'));
        $('<span/>').text(i + ": " + JSON.stringify(data[i])).appendTo(li);
    });
});

socket.on("disconnect", function(data) {
    console.log("Disconnected");
    clearBoard();
});

// Client
function draw() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    //if (board.length > 0) { hopefully not needed
        for (var i in board) {
            var obj = board[i];

            if (!obj.color) {
                console.error("Object structure incorrect");
                return;
            }

            ctx.fillStyle = toHexColor(obj.color);
            ctx.fillRect(obj.pos[0], obj.pos[1], obj.size, obj.size);
        }
    //}

    ctx.fillStyle = "#111";
    ctx.font="16px Ubuntu";
    ctx.fillText("fps: " + fps, canvas.width - 100, 30);
    
    // Get frames per second
    if (!lastFrame) {
        lastFrame = Date.now();
        fps = 0;
        return;
    }

    fps = Math.floor(1000/(Date.now() - lastFrame));
    lastFrame = Date.now();
}
setInterval(draw, 1000/60);

function randRange(a, b) {
    return Math.floor(Math.random()*(b-a)+a);
}

function toHexColor(rgb) {
    return "#" + rgb[0].toString(16)+rgb[1].toString(16)+rgb[2].toString(16);
}

function resize() {
    ctx.canvas.width  = window.innerWidth;
    ctx.canvas.height = window.innerHeight;
}
resize();
$(window).resize(resize);
