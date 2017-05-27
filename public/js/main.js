var canvas = document.getElementById('mainCanvas');
var ctx = canvas.getContext('2d');
var mousePos;

var objects = [
    {
        owner: "p1",
        color: [randRange(20, 220), randRange(20, 220), randRange(20, 220)],
        pos: [randRange(0, canvas.width), randRange(0, canvas.height)],
        size: 10
    }
];

$(document).keypress(function(e) {
    switch (e.which) {
        case "c":
          //  pos.random
    }
});

$(document).mousemove(function(e) {
    var rect = canvas.getBoundingClientRect();
    mousePos = {
        x: e.clientX - rect.left,
        y: e.clientY - rect.top
    };
});

$("canvas").mousedown(function(e) {
    objects.push(
        {
            owner: "p1",
            color: [randRange(20, 220), randRange(20, 220), randRange(20, 220)],
            pos: [mousePos.x, mousePos.y],
            size: 10
        }
    )
});

function randRange(a, b) {
    return Math.floor(Math.random()*(b-a)+a);
}

function draw() {
    // Clear the canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    // Draw all the objects
    for (var i in objects) {
        var obj = objects[i];

        ctx.fillStyle = "#" + obj.color[0].toString(16)+obj.color[1].toString(16)+obj.color[2].toString(16);
        ctx.fillRect(obj.pos[0], obj.pos[1], obj.size, obj.size);
    }
}
setInterval(draw, 1000/60);