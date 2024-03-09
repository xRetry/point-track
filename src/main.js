var gOffset = [0, 0];
var gDrone;
var gBeam;
var gPosTarget = [0,0];
/** @type {Sensor} */
var gSensor;

class Beam {
    angle = 0;
    html;

    constructor() {
        /** @type {HTMLElement} */
        this.html = document.querySelector('.beam');
    }

    rotate(state, angleRad) {
        const angleDeg = angleRad*(180/Math.PI);
        const corrY = 500 * Math.sin(angleRad);
        const corrX = 500 - 500 * Math.cos(angleRad);
        this.html.style.transform  = 'rotate(' + angleDeg + 'deg)';
        this.html.style.left = (state.pos[0] + 15 - corrX) + 'px';
        this.html.style.top  = (state.pos[1] + 15 + corrY) + 'px';
    }
}

class Target {
    pos = [0, 0];
    html;

    constructor() {
        /** @type {HTMLElement} */
        this.html = document.querySelector('.target');
        let rect = this.html.getBoundingClientRect();
        this.pos = [rect.left, rect.top];
    }
}

class State {
    pos = [0, 0];
    vel = [0, 0];
    time = 0;
    beam;
    target;
    html;

    constructor() {
        /** @type {HTMLElement} */
        this.html = document.querySelector('#sensor');

        /** @type {Beam} */
        this.beam = new Beam();

        /** @type {Target} */
        this.target = new Target();

        this.time = window.performance.now();
        this.pos = [this.html.offsetLeft, this.html.offsetTop];

        this.html.addEventListener('mousedown', handleMouseDown);
    }

    update(pos) {
        this.html.style.left = pos[0] + 'px';
        this.html.style.top  = pos[1] + 'px';

        const dx = [
            this.html.offsetLeft - this.pos[0],
            this.html.offsetTop - this.pos[1],
        ];
        const time = window.performance.now();
        const dt = time - this.time;
        this.time = time;

        this.pos = pos;
        this.vel = [dx[0]/dt, dx[1]/dt];
    }

    /**
     * @return {array<number>}
     */
    targetDistance() {
        return [
            this.target.pos[0] - this.pos[0],
            this.target.pos[1] - this.pos[1],
        ];
    }

    rotateBeam(angleRad) {
        this.beam.rotate(this, angleRad);
    }

}

class SensorObservation {
    pos = [0, 0];
    vel = [0, 0];

    /**
     * @param {SensorState} state
     */
    constructor(state) {
        this.pos = state.pos;
    }

    update(state) {
        const distance = state.targetDistance();

        const angle = Math.atan(distance[1]/distance[0]);

        state.rotateBeam(angle);
    }
}

class Sensor {
    constructor() {
        /** @type {State} */
        this.state = new State();
        /** @type {SensorObservation} */
        this.observation = new SensorObservation(this.state);
    }

    update(pos) {
        this.state.update(pos);
        this.observation.update(this.state);
    }
}

document.addEventListener('DOMContentLoaded', function() {
    gSensor = new Sensor();
})

function handleMouseDown(e) {
    const pos = [
        gSensor.state.pos - e.clientX,
        gSensor.state.pos - e.clientY
    ];
    console.log(gSensor.state.pos);
    gSensor.update(pos);

    gOffset = [
        gSensor.state.pos - e.clientX,
        gSensor.state.pos - e.clientY
    ];


    addEventListener("mousemove", handleMouseMove);
    addEventListener("mouseup", handleMouseUp);
}

function handleMouseUp() {
    removeEventListener('mousemove', handleMouseMove);
}

function handleMouseMove(e) {
    //gOffset = [0, 0];
    //console.log(gOffset);

    const pos = [
        e.clientX + gOffset[0],
        e.clientY + gOffset[1],
    ];
    gSensor.update(pos);

}

