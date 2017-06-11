var socket = io();
var canvas = document.getElementById("canvas");
var ctx = canvas.getContext("2d");

var lastFrame;
var fps;

var board = [];
var mouse = {
    down: false,
    x: 0,
    y: 0,
    prevX: 0,
    prevY: 0
};
var player = {
    name,
    color: [randRange(40, 200), randRange(40, 200), randRange(40, 200)]
};

// Client init
resize();

$(document).ready(function() {
    $("#color").val(player.color);

    player.name = prompt("Enter a name");
    setCookie("username", player.name);
});

// Send events
canvas.addEventListener('mousedown', onMouseDown, false);
canvas.addEventListener('mouseup', onMouseUp, false);
canvas.addEventListener('mouseout', onMouseUp, false);
canvas.addEventListener('mousemove', throttle(onMouseMove, 10), false);

function onMouseDown() {
    mouse.down = true;
}
function onMouseUp() {
    mouse.down = false;
}

function onMouseMove(e) {
    var rect = canvas.getBoundingClientRect();
    
    // Update the position of the mouse
    mouse.x = e.clientX - rect.left;
    mouse.y = e.clientY - rect.top;

    // Draw when dragging
    if (mouse.down) {
        drawLine();
    }

    // Save the last position
    mouse.prevX = e.clientX - rect.left;
    mouse.prevY = e.clientY - rect.top;
};

function drawLine() {
    var obj = {
        type: "line",
        pos: {
            start: [mouse.prevX, mouse.prevY],
            end: [mouse.x, mouse.y]
        },
        size: 3,
        color: player.color,
        owner: socket.id
    };

    console.log(toHexColor(obj.color));

    socket.emit("draw", obj);
}

function drawSquare() {
    var obj = {
        type: "square",
        pos: [mouse.x, mouse.y],
        size: 20,
        color: player.color,
        owner: socket.id
    };
    obj.pos = [obj.pos[0] - obj.size/2, obj.pos[1] - obj.size/2];

    socket.emit("draw", obj);
}

function clearOwnBoard() {
    socket.emit("clearOwnBoard", socket.id);
}

function clearBoard() {
    socket.emit("clearBoard", socket.id);
}


// Send chat message on return
$("#console input").on("keyup", function(e) {
    if (e.keyCode == 13) {
        // Instead of storing a color in each message, store user data
        socket.emit("chatMessage", {
            msg: $(this).val(),
            user: player.name,
            color: player.color
        });
        $(this).val("");
    }
});

// Apply settings
$("#apply").click(function() {
    console.log("Applying new settings");

    var color = $("#color").val().split(",");
    for (var i in color) {
        if (!color[i]) continue; // don't apply null values
        player.color[i] = parseInt(color[i]);
    }
});

// Receive events
socket.on("connect", function() {
    console.log("User ID: " + socket.id);
});

socket.on("userInit", function(data) {
    console.log("Receiving data from server...");
    console.log(data);
    for (var i in data) {
        board.push(data[i]);
    }
    console.log("Fetched " + data.board.length + " indices");
});

socket.on("draw", function(data) {
    board.push(data);
});

socket.on("clearOwnBoard", function(user) {
    board = board.filter(function(value, index, array) {
        return (value.owner != user);
    });
});

socket.on("clearBoard", function(user, silent) {
    if (!silent) {
        console.log(user + " cleared the board.");
        $("body").effect("shake", {times: 2});
    }
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
});

// Client
function draw() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    // Draw all objects
    for (var i in board) {
        var obj = board[i];
        
        switch (obj.type) {
            case "square":
                ctx.fillStyle = toHexColor(obj.color);
                ctx.fillRect(obj.pos[0], obj.pos[1], obj.size, obj.size);
            case "line":
                ctx.strokeStyle = toHexColor(obj.color);
                ctx.lineWidth = obj.size;
                ctx.beginPath();
                ctx.moveTo(obj.pos.start[0], obj.pos.start[1]);
                ctx.lineTo(obj.pos.end[0], obj.pos.end[1]);
                ctx.closePath();
                ctx.stroke();
        }
    }

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

// Limit the number of events per second
// (taken from socket.io demo)
function throttle(callback, delay) {
    var previousCall = new Date().getTime();
    return function() {
        var time = new Date().getTime();

        if ((time - previousCall) >= delay) {
            previousCall = time;
            callback.apply(null, arguments);
        }
    };
}

function randRange(a, b) {
    return Math.floor(Math.random()*(b-a)+a);
}

function toHexColor(rgb) {
    for (var i in rgb) {
        var hex = rgb[i].toString(16);
        rgb[i] = hex.length == 1 ? "0" + hex : hex;
    }
    return "#" + rgb[0] + rgb[1] + rgb[2];
}

function resize() {
    ctx.canvas.width  = window.innerWidth;
    ctx.canvas.height = window.innerHeight;
}
$(window).resize(resize);

// Cookie functions taken from https://www.w3schools.com/js/js_cookies.asp
function setCookie(cname, cvalue, exdays) {
    var d = new Date();
    d.setTime(d.getTime() + (exdays * 24 * 60 * 60 * 1000));
    var expires = "expires="+d.toUTCString();
    document.cookie = cname + "=" + cvalue + ";" + expires + ";path=/";
}

function getCookie(cname) {
    var name = cname + "=";
    var ca = document.cookie.split(';');
    for(var i = 0; i < ca.length; i++) {
        var c = ca[i];
        while (c.charAt(0) == ' ') {
            c = c.substring(1);
        }
        if (c.indexOf(name) == 0) {
            return c.substring(name.length, c.length);
        }
    }
    return "";
}