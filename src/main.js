var gOffset = [0, 0];
var gDrone;
var gBeam;
var gPos = [0,0];
var gPosTarget = [0,0];
var gtimeLast = 0;

document.addEventListener('DOMContentLoaded', function() {
    gDrone = document.querySelector('#drone');
    gBeam = document.querySelector('.beam');

    gDrone.addEventListener('mousedown', handleMouseDown);
})

function handleMouseDown(e) {
    target = document.querySelector('.target');
    const rect = target.getBoundingClientRect();
    gPosTarget = [rect.left, rect.top];

    gOffset = [
        gDrone.offsetLeft - e.clientX,
        gDrone.offsetTop - e.clientY
    ];

    addEventListener("mousemove", handleMouseMove);
    addEventListener("mouseup", handleMouseUp);
    gTimeLast = window.performance.now();
}

function handleMouseUp() {
    removeEventListener('mousemove', handleMouseMove);
}

function handleMouseMove(e) {
    //gOffset = [0, 0];
    gDrone.style.left = (e.clientX + gOffset[0]) + 'px';
    gDrone.style.top  = (e.clientY + gOffset[1]) + 'px';

    const rect = gDrone.getBoundingClientRect();
    distanceX = gPosTarget[0] - rect.left;
    distanceY = gPosTarget[1] - rect.top;

    const angle = Math.atan(distanceY/distanceX);
    const time = window.performance.now();
    dt = time - gTimeLast
    gTimeLast = time;

    console.log(dt);

    placeBeam(e.clientX, e.clientY, angle);
}

function placeBeam(x, y, angleRad) {
    angleDeg = angleRad*(180/Math.PI);
    corrY = 500 * Math.sin(angleRad);
    corrX = 500 - 500 * Math.cos(angleRad);
    gBeam.style.transform  = 'rotate(' + angleDeg + 'deg)';
    gBeam.style.left = (x + gOffset[0] + 15 - corrX) + 'px';
    gBeam.style.top  = (y + gOffset[1] + 15 + corrY) + 'px';
}

