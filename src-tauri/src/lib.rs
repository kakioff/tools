mod service;
mod store;
mod utils;
use std::env;

use service::lingkechaci;
use tauri::{
    menu::{Menu, MenuItem},
    tray::{MouseButton, MouseButtonState, TrayIconBuilder, TrayIconEvent},
    Emitter, Manager,
};
use tauri_plugin_store::StoreExt;

#[tauri::command]
async fn lingkechaci(content: &str, app: tauri::AppHandle) -> Result<String, ()> {
    let store = app
        .store(env::var("CONFIG_FILE").unwrap_or("config.json".to_string()))
        .unwrap();
    let config = store.get("lingkechaci").unwrap();
    let uid = config.get("userId").unwrap().as_str().unwrap();
    let cookie = config.get("cookie").unwrap().as_str().unwrap();

    let data = lingkechaci::chaci(content, uid, cookie).await;
    match data {
        Err(_) => Ok("{\"success\": false}".to_string()),
        Ok(d) => {
            let json = serde_json::to_string(&d).unwrap();
            Ok(format!(r#"{{"success": true, "data": {}}}"#, json))
        }
    }
    // format  to json string
}

#[tauri::command]
async fn update_hosts() -> Result<(), ()> {
    service::hosts::update_hosts().await;
    Ok(())
}
use std::ptr::null_mut;
use winapi::um::{
    processthreadsapi::{GetCurrentProcess, OpenProcessToken},
    securitybaseapi::GetTokenInformation,
    winnt::{TokenElevation, HANDLE, TOKEN_ELEVATION, TOKEN_QUERY},
};
fn is_running_as_admin() -> bool {
    unsafe {
        let mut token_handle: HANDLE = null_mut();
        if OpenProcessToken(GetCurrentProcess(), TOKEN_QUERY, &mut token_handle) == 0 {
            return false;
        }

        let mut elevation = TOKEN_ELEVATION { TokenIsElevated: 0 };
        let mut return_length: u32 = 0;
        if GetTokenInformation(
            token_handle,
            TokenElevation,
            &mut elevation as *mut _ as *mut _,
            size_of::<TOKEN_ELEVATION>() as u32,
            &mut return_length,
        ) == 0
        {
            return false;
        }

        elevation.TokenIsElevated != 0
    }
}

#[tauri::command]
fn is_admin() -> bool {
    let is_admin = is_running_as_admin();
    is_admin
}

// Learn more about Tauri commands at https://tauri.app/develop/calling-rust/
#[tauri::command]
fn greet(name: &str) -> String {
    format!("Hello, {}! You've been greeted from Rust!", name)
}

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    let mut app = tauri::Builder::default()
        .plugin(tauri_plugin_dialog::init())
        .plugin(tauri_plugin_process::init())
        .plugin(tauri_plugin_updater::Builder::new().build())
        .setup(|app| {
            let quit_i = MenuItem::with_id(app, "quit", "退出", true, None::<&str>)?;
            let settings_i = MenuItem::with_id(app, "settings", "设置", true, None::<&str>)?;
            let menu = Menu::with_items(app, &[&settings_i, &quit_i])?;
            let _tray = TrayIconBuilder::new()
                .icon(app.default_window_icon().unwrap().clone())
                .menu(&menu)
                .show_menu_on_left_click(true)
                .on_menu_event(|app, event| match event.id.as_ref() {
                    "quit" => {
                        app.exit(0);
                    }
                    "settings" => app.emit("open-settings", ()).unwrap(),
                    _ => {}
                })
                .on_tray_icon_event(|tray, event| match event {
                    TrayIconEvent::Click {
                        button: MouseButton::Left,
                        button_state: MouseButtonState::Up,
                        ..
                    } => {
                        let app = tray.app_handle();
                        if let Some(window) = app.get_webview_window("main") {
                            let _ = window.show();
                            let _ = window.set_focus();
                        }
                    }
                    _ => {}
                })
                .tooltip("Byron's Tools")
                .title("Byron's Tools")
                .build(app)
                .unwrap();
            Ok(())
        })
        .plugin(tauri_plugin_store::Builder::new().build())
        .plugin(tauri_plugin_shell::init());

    app = utils::window::add_handles(app);
    app = utils::tarnslate::add_handles(app);
    app.invoke_handler(tauri::generate_handler![
        greet,
        lingkechaci,
        update_hosts,
        is_admin
    ])
    .run(tauri::generate_context!())
    .expect("error while running tauri application");
}
