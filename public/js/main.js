/* variable launch */
var socket = io();
var lastFrame;
var fps;
var zed;
var canvas = document.getElementById("canvas");
var ctx = canvas.getContext("2d");
var outputColor = '#111'
var gameStarted = false;
var timer = 3600;
var playerTurn = 0;
var board = [];
var mouse = {
    down: false,
    x: 0,
    y: 0
};
var word = '';
var words = [
    "car",
    "house",
    "dog",
    "cat",
    "fishing",
    "sunglasses",
    "bed",
    "leaf",
    "tree",
    "castle",
    "feet",
    "robot" ,
    "laser",
    "storm",
    "TV",
    "horse",
    "boat"
];
var player = {
    name: prompt("Enter a name"),
    color: [randRange(40, 200), randRange(40, 200), randRange(40, 200)]
};



/* Client init */
$(function() {
    $("#color").val(player.color);
});

//Mouse down = draw
$("canvas").mousedown(function() {
        mouse.down = true;
        newObject();
});

//Mouse up = no draw
$("canvas").mouseup(function() {
    mouse.down= false;
});

// Send events
$("canvas").mousemove(function(e) {
    // Update the position of the mouse
    var rect = canvas.getBoundingClientRect();
    mouse.x = e.clientX - rect.left;
    mouse.y = e.clientY - rect.top;

    // Draw when dragging #Depreciated
    if (mouse.down) {
        newObject();
    }
});

//Message sent on "return"
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

//Creates circle
function newObject() {
    var obj = { 
        pos: [mouse.x, mouse.y],
        size:   10,
        color: player.color,
        owner: socket.id,
    };
    obj.pos = [obj.pos[0] - obj.size/2, obj.pos[1] - obj.size/2];

    socket.emit("createObj", obj);
}

function clearOwnBoard() {
    socket.emit("clearOwnBoard");
}

function gameStart() {
    if (gameStarted == false) {
        socket.emit("gameStart");
        socket.emit("timerStart");
        var gang = randRange(0,10);
        word = words[gang];
        socket.emit(word);
    }
}

function correctGuess() {
    socket.emit("correctGuess")
}

function incorrectGuess() {
    socket.emit("incorrectGuess")
}

function clearBoard() {
    socket.emit("clearBoard");
}

//jquery apply button
$("#apply").click(function() {
    console.log("Applying new settings");
    var color = $("#color").val().split(",");
    for (var i in color) {
        if (!color[i]) continue; // don't apply null values
        player.color[i] = parseInt(color[i]);
    }
});



/* Receive events */
socket.on("connect", function() {
    console.log("User ID: " + socket.id);
});

socket.on("userInit", function(data) {
    console.log("Receiving data from server...");
    for (var i in data) {
        board.push(data[i]);
    }
    console.log("Fetched " + data.length + " indices");
});``

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
    }
    board = [];
});

socket.on("chatMessage", function(data) {
    $("#console ul").append('<li><span style="color: ' + toHexColor(data.color) + '">' + data.user.substring(0, 6) + '</span>' + data.msg + '</li>');
})

socket.on("gameStart", function() {
    var gameStarted = true;
    socket.emit("timerStart");
    socket.emit("clearBoard")
    timer = 3600; // per 60 second interval
    
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

socket.on("correctGuess", function() {
    if (gameStarted == true){
        alert("Correct!");
        timer = 0;
    }
});

socket.on("incorrectGuess", function(){
    if (gameStarted == true){
        $("body").effect("shake", {times: 3});
    }
    
});

socket.on("timerStart", function() {
    zed = 1;
});



/* Client loop */
function draw() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    for (var i in board) {
        var obj = board[i];
        ctx.beginPath();
        ctx.arc(obj.pos[0], obj.pos[1], obj.size, 0, 2 * Math.PI);
        ctx.fillStyle = toHexColor(obj.color);
        ctx.fill();
    }
    if (zed == 1) {
        gameStarted = true;
        timer = timer - 1;
            if (timer < 1) {
                timer = 0;
         };
        };
    if (timer == 0) {
        alert("Time's up!")
        zed = 0;
        timer = 3600;
        outputColor = '#111';
        socket.emit("clearBoard");
        gameStarted = false;
    }
    var timed = Math.floor(timer/60);
      if (timed < 10) {
          outputColor = '#FF0000';
            }
     ctx.fillStyle = outputColor;
     ctx.font="16px Ubuntu";
     ctx.fillText("sec: " + timed, canvas.width - 100, 30);
     ctx.fillStyle = '#111';
     ctx.font="16px Ubuntu";
     ctx.fillText("Word: " + word, canvas.width - 300, 30);
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
