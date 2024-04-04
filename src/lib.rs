use wasm_bindgen::prelude::*;
use web_sys::{HtmlElement, window, console};
use std::f64::consts::PI;
use std::time::Duration;
use console_error_panic_hook;
use fluvio_wasm_timer::Delay;

type Pos = [i32; 2];

#[wasm_bindgen]
pub async fn run_sim() {
    console_error_panic_hook::set_once();

    let mut state = State::new();
    let mut sensor = Sensor::new(state.sensor.pos, state.target.pos);

    loop {
        console::log_1(&"Loop".into());

        // TODO(marco): Figure out way to get position from mousemove event
        state.update([0, 0]);
        let angle = sensor.update_with_pos(state.sensor.pos);
        state.rotate_beam(angle);
        Delay::new(Duration::from_millis(50)).await.ok();
    }
}

struct SensorState {
    pub pos: Pos,
    pub vel: [f64; 2],
    pub acc: [f64; 2],
    pub html: HtmlElement,
}

struct BeamState {
    pub angle: f64,
    pub html: HtmlElement,
}

struct TargetState {
    pub pos: Pos,
    pub html: HtmlElement,
}

struct State {
    sensor: SensorState,
    beam: BeamState,
    target: TargetState,
    time: f64,
    dt: f64,
    dt_old: f64,
}

impl State {
    fn new() -> Self {
        let document = window().unwrap().document().unwrap();
        let html_sensor: HtmlElement = document.query_selector("#sensor")
            .unwrap().unwrap().dyn_into().unwrap();
        let sensor = SensorState{
            pos: [html_sensor.offset_left(), html_sensor.offset_top()],
            vel: [0., 0.],
            acc: [0., 0.],
            html: html_sensor,
        };

        let html_target: HtmlElement = document.query_selector(".target")
            .unwrap().unwrap().dyn_into().unwrap();
        let target = TargetState{
            pos: [html_target.offset_left(), html_target.offset_top()],
            html: html_target,
        };

        return Self{
            sensor,
            beam: BeamState{
                angle: 0.,
                html: document.query_selector(".beam").unwrap().unwrap().dyn_into().unwrap(),
            },
            target,
            time: window().unwrap().performance().unwrap().now(),
            dt: 0.,
            dt_old: 0.,
        };
    }

    fn update(&mut self, pos: Pos) {
        let time = window().unwrap().performance().unwrap().now();
        self.dt_old = self.dt;
        self.dt = time - self.time;
        self.time = time;

        self.update_sensor(pos);
        self.update_beam(pos, self.beam.angle);
    }

    fn update_sensor(&mut self, pos: Pos) {
        self.sensor.html.style()
            .set_property("left", &(pos[0].to_string() + "px"))
            .unwrap();
        self.sensor.html.style()
            .set_property("top", &(pos[1].to_string() + "px"))
            .unwrap();

        let d_pos = [
            self.sensor.html.offset_left() - self.sensor.pos[0],
            self.sensor.html.offset_top() - self.sensor.pos[1],
        ];

        self.sensor.pos = pos;
        let dt_secs = self.dt;
        let vel_old = [self.sensor.vel[0], self.sensor.vel[1]];
        self.sensor.vel = [
            d_pos[0] as f64 / dt_secs,
            d_pos[1] as f64 / dt_secs,
        ];

        self.sensor.acc[0] = (self.sensor.vel[0] - vel_old[0]) / (0.5*dt_secs + 0.5*self.dt_old);
        self.sensor.acc[1] = (self.sensor.vel[1] - vel_old[1]) / (0.5*dt_secs + 0.5*self.dt_old);
    }

    fn update_beam(&mut self, pos: Pos, angle_rad: f64) {
        let angle_deg = angle_rad*(180./PI);
        let x_corr = 500. - 500. * angle_rad.cos();
        let y_corr = 500. * angle_rad.sin();

        self.beam.html.style()
            .set_property("transform", &format!("rotate({}deg)", angle_deg))
            .unwrap();
        self.sensor.html.style()
            .set_property("left", &((pos[0] as f64 + 15. - x_corr).to_string() + "px"))
            .unwrap();
        self.sensor.html.style()
            .set_property("top", &((pos[1] as f64 + 15. + y_corr).to_string() + "px"))
            .unwrap();
    }

    fn get_beam_length(&self) -> f64 {
        let diff_x = self.target.pos[0] - self.sensor.pos[0];
        return diff_x as f64 / self.beam.angle.cos();
    }

    fn rotate_beam(&mut self, angle_rad: f64) {
        self.update_beam(self.sensor.pos, angle_rad);
    }
}

struct Sensor {
    pos: Pos,
    vel: [f64; 2],
    pos_target: Pos,
}

impl Sensor {
    fn new(pos: Pos, pos_target: Pos) -> Self {
        return Self{
            pos,
            pos_target,
            vel: [0., 0.],
        };
    }

    fn update_with_pos(&mut self, pos_true: Pos) -> f64 {
        self.pos = pos_true;
        let angle = (
            (
                (
                    self.pos_target[1] - self.pos[1]
                ) / (
                    self.pos_target[0] - self.pos[0]
                )
            ) as f64
        ).atan();

        return angle;
    }
}
