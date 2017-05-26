var canvas = document.getElementById('mainCanvas');
var ctx = canvas.getContext('2d');
var w = canvas.width;
var h = canvas.height;

var obj = [
    {
        name: "square",
        pos: [10, 10],
        size: [100, 100]
    }
];

$(document).keypress(function(event) {
    switch (event.which) {
        case "c":
          //  pos.random

    }
});

function draw() {
    ctx.clearRect(0, 0, w, h);
    
    ctx.fillStyle = "#000000";
    for (var i in obj) {
        ctx.fillRect(obj[i].pos[0], obj[i].pos[1], obj[i].size[0], obj[i].size[1]);
    }
}
setInterval(draw, 50/3); //1000/fps