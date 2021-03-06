var socket = io();
var canvas = document.getElementById("canvas");
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
    name: prompt("Enter a name"),
    color: [randRange(40, 200), randRange(40, 200), randRange(40, 200)]
};

// Client init
$(function() {
    $("#color").val(player.color);
});
/*
if (/Android|webOS|iPhone|iPad|iPod|BlackBerry|BB|PlayBook|IEMobile|Windows Phone|Kindle|Silk|Opera Mini/i.test(navigator.userAgent)) {
    $("canvas").touchstart(function(){
        touch.start = true;
        touch
        newObject();
}) else {
        
    };
}
*/
$("canvas").mousedown(function() {
        mouse.down = true;
        newObject();
});
$("canvas").mouseup(function() {
    mouse.down = false;
});

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
            user: player.name,
            color: player.color
        });
        $(this).val("");
    }
});

function newObject() {
    var obj = {
        pos: [mouse.x, mouse.y],
        size: 20,
        color: player.color,
        owner: socket.id,
    };
    obj.pos = [obj.pos[0] - obj.size/2, obj.pos[1] - obj.size/2];

    socket.emit("createObj", obj);
}

function clearOwnBoard() {
    socket.emit("clearOwnBoard", socket.id);
}

function clearBoard() {
    socket.emit("clearBoard", socket.id);
}

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
    for (var i in data) {
        board.push(data[i]);
    }
    console.log("Fetched " + data.length + " indices");
});

socket.on("createObj", function(data) {
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
    
    for (var i in board) {
        var obj = board[i];

        ctx.fillStyle = toHexColor(obj.color);
        ctx.fillRect(obj.pos[0], obj.pos[1], obj.size, obj.size);
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
