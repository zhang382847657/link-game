export function lightningAnimate(ctx, canvas, ptArray) {
    return setInterval(function () {
        ctx.clearRect(0,0,canvas.width,canvas.height);
        // blur(ctx, canvas, 1);
        ptArray.map(function (value) {
            draw(ctx, value[0], value[1]);
        });
        // fade(ctx, 0)
    },60);
}

function draw(ctx, pt1, pt2) {

    // 模拟闪电的颜色
    ctx.fillStyle =  'rgba(255,255,255,0.8)';
    ctx.strokeStyle = 'rgba(73,147,255,0.8)';

    var iterations = [pt1, pt2]
    var newiterations, i, j
    for (i = 0; i < 8; i++) {
        newiterations = [iterations[0]]
        for(j = 1; j < iterations.length; j++) {
            newiterations.push(getRandMidpoint(iterations[j-1], iterations[j], 100/(i*i+20)))
            newiterations.push(iterations[j])
        }
        iterations = newiterations.concat([])
    }
    ctx.beginPath();
    ctx.moveTo(iterations[0].x, iterations[0].y);
    ctx.lineWidth = 2;

    for (i = 1; i < iterations.length; i++) {
        ctx.lineTo(iterations[i].x, iterations[i].y);
    }
    ctx.stroke();
    ctx.fill();
    ctx.closePath()
}

function getRandMidpoint(pa, pb, range) {
    var a = Math.atan2(pb.y-pa.y, pb.x-pa.x) + Math.PI/2
    var half = {y:(pb.y-pa.y)/2 + pa.y, x:(pb.x-pa.x)/2 + pa.x}
    var offset = Math.random() * range - range/2
    var ho = {
        x: Math.cos(a) * offset + half.x,
        y: Math.sin(a) * offset + half.y
    }
    return ho
}
