#!/bin/sh

wasm-pack build --debug --target web && python -m http.server
