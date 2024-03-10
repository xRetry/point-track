/** @type {[number, number]} */
var gOffset = [0, 0];
/** @type {State} */
var gState;
/** @type {Sensor} */
var gSensor;

/** 
 * @typedef {Object} TargetState
 * @property {[number, number]} pos
 * @property {HTMLElement} html
 */

/** 
 * @typedef {Object} BeamState
 * @property {number} angle
 * @property {HTMLElement} html
 */

/** 
 * @typedef {Object} SensorState
 * @property {[number, number]} pos
 * @property {[number, number]} vel
 * @property {HTMLElement} html
 */


class State {
    /** @type {SensorState} */
    sensor;
    /** @type {BeamState} */
    beam;
    /** @type {TargetState} */
    target;
    /** @type {number} */
    time;
    /** @type {number} */
    dt = 0;

    constructor() {
        const htmlSensor = document.querySelector('#sensor');
        this.sensor = {
            html: htmlSensor,
            pos: [htmlSensor.offsetLeft, htmlSensor.offsetTop],
            vel: [0, 0],
        };

        this.beam = {
            html: document.querySelector('.beam'),
            angle: 0,
        };

        const htmlTarget = document.querySelector('.target');
        const rect = htmlTarget.getBoundingClientRect();
        this.target = {
            pos: [rect.left, rect.top],
            html: htmlTarget,
        };

        this.time = window.performance.now();

        this.sensor.html.addEventListener('mousedown', handleMouseDown);
    }

    /**
     * @param {[number, number]} pos
     * @returns {void}
     */
    update(pos) {
        const time = window.performance.now();
        this.dt = time - this.time;
        this.time = time;

        this.updateSensor(pos);
        this.updateBeam(pos);
    }

    /**
     * @param {[number, number]} pos
     * @returns {void}
     */
    updateSensor(pos) {
        this.sensor.html.style.left = pos[0] + 'px';
        this.sensor.html.style.top  = pos[1] + 'px';

        const dx = [
            this.sensor.html.offsetLeft - this.sensor.pos[0],
            this.sensor.html.offsetTop - this.sensor.pos[1],
        ];

        this.sensor.pos = pos;
        this.sensor.vel = [dx[0]/this.dt, dx[1]/this.dt];
    }

    /**
     * @param {[number, number]} pos
     * @param {angle} angleRad
     * @returns {void}
     */
    updateBeam(pos, angleRad) {
        const angleDeg = angleRad*(180/Math.PI);
        const corrY = 500 * Math.sin(angleRad);
        const corrX = 500 - 500 * Math.cos(angleRad);
        this.beam.html.style.transform  = 'rotate(' + angleDeg + 'deg)';
        this.beam.html.style.left = (pos[0] + 15 - corrX) + 'px';
        this.beam.html.style.top  = (pos[1] + 15 + corrY) + 'px';
    }

    /**
     * @returns {[number, number]}
     */
    targetDistance() {
        return [
            this.target.pos[0] - this.sensor.pos[0],
            this.target.pos[1] - this.sensor.pos[1],
        ];
    }

    /**
     * @param {angle} angleRad
     * @returns {void}
     */
    rotateBeam(angleRad) {
        this.updateBeam(this.sensor.pos, angleRad);
    }
}

class Sensor {
    pos = [0, 0];
    vel = [0, 0];

    constructor() {
        this.pos = gState.sensor.pos;
    }

    update() {
        const distance = gState.targetDistance();
        const angle = Math.atan(distance[1]/distance[0]);

        gState.rotateBeam(angle);
    }
}

document.addEventListener('DOMContentLoaded', function() {
    gState = new State();
    gSensor = new Sensor();

})

function handleMouseDown(e) {
    gState.update(gState.sensor.pos);

    gOffset = [
        gState.sensor.pos[0] - e.clientX,
        gState.sensor.pos[1] - e.clientY
    ];

    gSensor.update();

    addEventListener("mousemove", handleMouseMove);
    addEventListener("mouseup", handleMouseUp);
}

function handleMouseUp() {
    removeEventListener('mousemove', handleMouseMove);
}

function handleMouseMove(e) {
    const pos = [
        e.clientX + gOffset[0],
        e.clientY + gOffset[1],
    ];
    gState.update(pos);
    gSensor.update();
}

