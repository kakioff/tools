// Prevents additional console window on Windows in release, DO NOT REMOVE!!
#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]

pub mod service;
pub mod utils;
pub mod store;

fn main() {
    tools_lib::run()
}
