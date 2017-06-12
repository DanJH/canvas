var socket = io();
var canvas = document.getElementById("canvas");
var ctx = canvas.getContext("2d");

var player = {
    color: toHexColor([randRange(40, 200), randRange(40, 200), randRange(40, 200)]),
    size: 8
};

var mouse = {
    down: [],
    x: 0,
    y: 0,
    prevX: 0,
    prevY: 0
};

// Client init
resize();
$("#color").spectrum({
    color: player.color,
    showPalette: true
});

$(document).ready(function() {
    if (getCookie("username" == "")) socket.username = prompt("Choose a name:");

    $("#name").val(getCookie("username")).change();
    $("#size").val(player.size);
});

// Send events
canvas.addEventListener('mousedown', onMouseDown, false);
canvas.addEventListener('mouseup', onMouseUp, false);
canvas.addEventListener('mouseout', onMouseUp, false);
canvas.addEventListener('mousemove', throttle(onMouseMove, 10), false);

function onMouseDown(e) {
    mouse.down[e.button] = true;

    if (e.button == 1) {
        console.log(canvas.toDataURL());
    }
}
function onMouseUp(e) {
    mouse.down[e.button] = false;
}

function onMouseMove(e) {
    var rect = canvas.getBoundingClientRect();
    
    // Update the position of the mouse
    mouse.x = e.clientX - rect.left;
    mouse.y = e.clientY - rect.top;

    if (mouse.down[0]) {
        drawLine();
    } else if (mouse.down[2]) {
        erase();
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

function erase() {
    var obj = {
        type: "eraser",
        pos: {
            start: [mouse.prevX, mouse.prevY],
            end: [mouse.x, mouse.y]
        },
        size: player.size * 3
    };

    socket.emit("draw", obj);
}

function clearBoard() {
    socket.emit("clearBoard", socket.username);
}

// Send chat message on return
$("#console input").on("keyup", function(e) {
    if (e.keyCode == 13) {
        if ($(this).val() == "") return;

        // TODO: Instead of storing a color in each message, store user data
        socket.emit("chatMessage", {
            msg: $(this).val(),
            user: socket.username,
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
            socket.username = $(this).val();
            setCookie("username", socket.username);
        default:
            player[$(this).attr("id")] = $(this).val();
            break;
    }
});
$("#color").on('change.spectrum', function(e, color) {
    player.color = color.toHex(false);
});


// Receive events
socket.on("connect", function() {
    console.log("User ID: " + socket.id);
});

socket.on("userInit", function(data) {
    console.log("Receiving data from server...");
    
    // Draw all objects
    for (var i in data) {
        var obj = data[i];
        draw(obj);
    }

    $("#indices").text(data.length + " indices");
    console.log("Fetched " + data.length + " indices");
});

socket.on("draw", draw);

socket.on("indexCount", function(indices) {
    $("#indices").text(indices + " indices");
});

socket.on("clearBoard", function(user, silent) {
    if (!silent) {
        chatMessage({
            msg: " cleared the board.</i>",
            user: "<i>" + user,
            color: "222222"
        });
        //$("body").effect("shake", {times: 2});
    }
    
    ctx.clearRect(0, 0, canvas.width, canvas.height);
});

socket.on("chatMessage", chatMessage);

socket.on("disconnect", function(data) {
    console.log("Disconnected");
});

// Client
function draw(obj) {
    if (obj.type == "line") {
        ctx.globalCompositeOperation = "source-over";

        ctx.strokeStyle = "#" + obj.color;
        ctx.lineWidth = obj.size;
        ctx.beginPath();
        ctx.lineCap = "round";
        ctx.moveTo(obj.pos.start[0], obj.pos.start[1]);
        ctx.lineTo(obj.pos.end[0], obj.pos.end[1]);
        ctx.stroke();
    } else if (obj.type == "eraser") {
        ctx.globalCompositeOperation = "destination-out";

        ctx.lineWidth = obj.size;
        ctx.beginPath();
        ctx.moveTo(obj.pos.start[0], obj.pos.start[1]);
        ctx.lineTo(obj.pos.end[0], obj.pos.end[1]);
        ctx.stroke();
    }
}

function chatMessage(data) {
    $("#console ul").append(`<li><span style="color: #${data.color}">${data.user.substring(0, 16)}</span>${data.msg}</li>`);
    $("#console ul").scrollTop($("#console ul")[0].scrollHeight); // auto scroll to bottom
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