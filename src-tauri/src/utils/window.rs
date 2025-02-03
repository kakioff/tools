use tauri::{Manager, WebviewUrl};

#[tauri::command]
pub fn create_settings_window(app: tauri::AppHandle) -> String {
    let settings_webview = if let Some(window) = app.get_webview_window("settings") {
        window
    } else {
        let mut builder =
            tauri::WebviewWindowBuilder::new(&app, "settings", WebviewUrl::App("/settings".into()))
                .title("设置")
                .inner_size(400.0, 600.0)
                .resizable(false)
                // .decorations(false)
                .content_protected(true)
                .skip_taskbar(true)
                .maximizable(false)
                .minimizable(false)
                .center();

        builder = match app.get_webview_window("main") {
            Some(main_window) => builder.parent(&main_window).unwrap(),
            None => builder,
        };
        builder.build().unwrap()
    };
    println!("create settings window: {:?}", settings_webview);
    settings_webview.show().unwrap();
    settings_webview.set_focus().unwrap();
    "OK".to_string()
}

// pub fn add_handles(app: Builder<Wry>) -> Builder<Wry> {
//     app.invoke_handler(tauri::generate_handler![create_settings_window])
// }
