var canvas = document.getElementById('mainCanvas');
var ctx = canvas.getContext('2d');

$(document).keypress(function(event) {
    switch (event.which) {
        case "w":
            //left
        case "s":
        case "a":
        
    }
});

function draw(e) {   
    var pos = getMousePos(canvas, e);
    posx = pos.x;
    posy = pos.y;

    ctx.fillStyle = "#000000";
    ctx.fillRect(posx, posy, 4, 4);
} 
setInterval(draw, 50/3); //1000/fps