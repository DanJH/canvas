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
    color: toHexColor([randRange(40, 200), randRange(40, 200), randRange(40, 200)]),
    size: 8
};


// Client init
resize();

$(document).ready(function() {
    if (getCookie("username" == "")) player.name = prompt("Choose a name:");
    
    $("#name").val(getCookie("username")).change();
    $("#color").val(player.color);
    $("#size").val(player.size);
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
        size: player.size,
        color: player.color,
        owner: socket.id
    };

    socket.emit("draw", obj);
}

function drawSquare() {
    var obj = {
        type: "square",
        pos: [mouse.x, mouse.y],
        size: player.size,
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
    socket.emit("clearBoard", player.name);
}


// Send chat message on return
$("#console input").on("keyup", function(e) {
    if (e.keyCode == 13) {
        if ($(this).val() == "") return;

        // TODO: Instead of storing a color in each message, store user data
        socket.emit("chatMessage", {
            msg: $(this).val(),
            user: player.name,
            color: player.color
        });
        $(this).val("");
    }
});

// Apply settings on input change
$("input").change(function() {
    switch ($(this).attr("id")) {
        case "name":
            if ($(this).val().length < 3 || $(this).val().length > 12) {
                chatMessage({
                    msg: "Username invalid (between 3 and 12 char.)</i>",
                    user: "<i>",
                    color: player.color
                });
                return;
            }
            player.name = $(this).val();
            setCookie("username", player.name);
        default:
            player[$(this).attr("id")] = $(this).val();
            break;
    }
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
        chatMessage({
            msg: user + " cleared the board.</i>",
            user: "<i>",
            color: "aa2222"
        });
        //$("body").effect("shake", {times: 2});
    }
    board = [];
});

socket.on("chatMessage", chatMessage);

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
                ctx.fillStyle = "#" + obj.color;
                ctx.fillRect(obj.pos[0], obj.pos[1], obj.size, obj.size);
            case "line":
                ctx.strokeStyle = "#" + obj.color;
                ctx.lineWidth = obj.size;
                ctx.beginPath();
                ctx.lineCap = "round";
                ctx.moveTo(obj.pos.start[0], obj.pos.start[1]);
                ctx.lineTo(obj.pos.end[0], obj.pos.end[1]);
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

function chatMessage(data) {
    //`Fifteen is ${a + b}.`
    $("#console ul").append(`<li><span style="color: #${data.color}">${data.user.substring(0, 12)}</span>${data.msg}</li>`);
    $('#console ul').prop("scrollHeight"); // auto scroll to bottom
}

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
    return rgb[0] + rgb[1] + rgb[2];
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