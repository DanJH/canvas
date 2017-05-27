var socket = io();
var canvas = document.getElementById("mainCanvas");
var ctx = canvas.getContext("2d");

var objects = [];
var mouse = {
    down: false,
    x: 0,
    y: 0
};


function randRange(a, b) {
    return Math.floor(Math.random()*(b-a)+a);
}

function resize() {
    ctx.canvas.width  = window.innerWidth;
    ctx.canvas.height = window.innerHeight;
}
resize();

$("canvas").mousedown(function() {
    socket.emit("instantiateObj", {
        owner: socket.io.engine.id,
        color: [randRange(20, 220), randRange(20, 220), randRange(20, 220)],
        pos: [mouse.x, mouse.y],
        size: 20
    });
});

$("canvas").mousemove(function(e) {
    // Update the position of the mouse
    var rect = canvas.getBoundingClientRect();
    mouse = {
        x: e.clientX - rect.left,
        y: e.clientY - rect.top
    };

    if (mouse.down) {
        socket.emit("instantiateObj", {
            owner: socket.io.engine.id,
            color: [randRange(20, 220), randRange(20, 220), randRange(20, 220)],
            pos: [mouse.x, mouse.y],
            size: 20
        });
    }
});


// Add event listeners
$(window).resize(resize);

// Renders the canvas contents
function draw() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    for (var i in objects) {
        var obj = objects[i];

        ctx.fillStyle = "#" + obj.color[0].toString(16)+obj.color[1].toString(16)+obj.color[2].toString(16);
        ctx.fillRect(obj.pos[0], obj.pos[1], obj.size, obj.size);
    }

    ctx.fillStyle = "#111";
    ctx.font="16px Ubuntu";
    ctx.fillText(mouse.x + ", " + mouse.y, 30, 20);
}
setInterval(draw, 1000/60);

// Client
function clearBoard() {
    socket.emit("clearBoard", socket.id);
}

// Network events
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
