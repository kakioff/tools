use std::{env, sync::Arc};

use tauri::Wry;
use tauri_plugin_store::{Store, StoreExt};

pub fn get_config(app: &tauri::AppHandle) -> Option<Arc<Store<Wry>>> {
    let store = app.store(env::var("CONFIG_FILE").unwrap_or("config.json".to_string()));
    if let Ok(store) = store {
        Some(store)
    } else {
        None
    }
}

pub fn get_silicon_flow_api_key(app: &tauri::AppHandle) -> Option<String> {
    let store = get_config(app);
    if store.is_none() {
        return None;
    }
    let silicon_flow = store.unwrap().get("SiliconFlow");
    if silicon_flow.is_none() {
        return None;
    }
    Some(silicon_flow.unwrap().get("apiKey").unwrap().as_str().unwrap().to_string())
}
