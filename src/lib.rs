use wasm_bindgen::prelude::*;
use web_sys::{HtmlElement, window};
use std::time::{Instant, Duration};

type Pos = [i32; 2];

#[wasm_bindgen]
extern {
    pub fn alert(s: &str);
}

#[wasm_bindgen]
pub fn greet(name: &str) {
    alert(&format!("Hello, {}!", name));
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
    time: Instant,
    dt: Duration,
    dt_old: Duration,
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
            time: Instant::now(),
            dt: Duration::new(0, 0),
            dt_old: Duration::new(0, 0),
        };
    }

    fn update(&mut self, pos: Pos) {
        let time = Instant::now();
        self.dt_old = self.dt;
        self.dt = self.time.elapsed();
        self.time = time;

        self.update_sensor(pos);
        self.update_beam(pos);
    }

    fn update_sensor(&mut self, pos: Pos) {
        todo!();
    }

    fn update_beam(&mut self, pos: Pos) {
        todo!();
    }
}
