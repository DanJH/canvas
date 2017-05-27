var socket = io();
var canvas = document.getElementById("mainCanvas");
var ctx = canvas.getContext("2d");

var objects = [];
var mouse = {
    down: false,
    x: 0,
    y: 0
};

var player = {
    color: [randRange(40, 200), randRange(40, 200), randRange(40, 200)]
};

function resize() {
    ctx.canvas.width  = window.innerWidth;
    ctx.canvas.height = window.innerHeight;
}
resize();
$(window).resize(resize);

$("canvas").mousedown(function() {
    mouse.down = true;
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

// Network events
$("canvas").mousemove(function(e) {
    // Update the position of the mouse
    var rect = canvas.getBoundingClientRect();

    mouse.x = e.clientX - rect.left;
    mouse.y = e.clientY - rect.top;

    // Draw when dragging
    if (mouse.down) {
        var obj = {
            owner: socket.id,
            size: 100,
            color: player.color,
            pos: [mouse.x, mouse.y]
        };

        obj.pos = [obj.pos[0] - obj.size/2, obj.pos[1] - obj.size/2]

        socket.emit("instantiateObj", obj);
        console.log();
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

socket.on("connect", function() {
    console.log(socket);
    console.log("User ID: " + socket.id);
});

socket.on("instantiateObj", function(data) {
    objects.push(data);
});

socket.on("clearBoard", function(data) {
    console.log(data + " cleared the board.");

    objects = [];
});

socket.on("chatMessage", function(data) {
    $("#console ul").append('<li><span style="color: ' + toHexColor(data.color) + '">' + data.user.substring(0, 5) + '</span> ' + data.msg + '</li>');
});

// Renders the canvas contents
function draw() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    for (var i in objects) {
        var obj = objects[i];

        ctx.fillStyle = toHexColor(obj.color);
        ctx.fillRect(obj.pos[0], obj.pos[1], obj.size, obj.size);
    }

    ctx.fillStyle = "#111";
    ctx.font="16px Ubuntu";
    ctx.fillText(mouse.x + ", " + mouse.y, 30, 20);
}
setInterval(draw, 1000/60);

function randRange(a, b) {
    return Math.floor(Math.random()*(b-a)+a);
}

function toHexColor(rgb) {
    return "#" + rgb[0].toString(16)+rgb[1].toString(16)+rgb[2].toString(16);
}

// Client
function clearBoard() {
    socket.emit("clearBoard", socket.id);
}
