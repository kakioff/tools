use crate::{service::hosts, utils::is_running_as_admin};

#[tauri::command]
pub async fn update_hosts() -> Result<(), ()> {
    if !is_running_as_admin() {
        return Err(());
    }
    hosts::update_hosts().await;
    Ok(())
}



#[tauri::command]
pub fn get_hosts_content() -> Result<String, ()> {
    if !is_running_as_admin() {
        return Err(());
    }
    Ok(hosts::get_hosts())
}

#[tauri::command]
pub fn save_hosts_content(content: String) -> Result<(), ()> {
    if !is_running_as_admin() {
        return Err(());
    }
    hosts::save_hosts(content);
    Ok(())
}
// use std::sync::Mutex;
// use tokio::time::{interval, Duration};
// use std::sync::Arc;

// // 定时器状态
// struct TimerState {
//     interval: Duration,
//     is_running: bool,
// }

// // 全局定时器状态
// static TIMER_STATE: Mutex<Option<TimerState>> = Mutex::new(None);

// #[tauri::command]
// pub fn create_hosts_timer(minutes: u64) -> Result<(), ()> {
//     let mut state = TIMER_STATE.lock().unwrap();
//     if state.is_some() {
//         return Err(());
//     }
    
//     *state = Some(TimerState {
//         interval: Duration::from_secs(minutes * 60),
//         is_running: false
//     });
    
//     Ok(())
// }

// #[tauri::command]
// pub async fn start_hosts_timer() -> Result<(), ()> {
//     let state = TIMER_STATE.lock().unwrap();
//     if state.is_none() || state.as_ref().unwrap().is_running {
//         return Err(());
//     }
    
//     let interval_duration = state.as_ref().unwrap().interval;
//     drop(state);
    
//     let state = Arc::new(TIMER_STATE);
    
//     tauri::async_runtime::spawn(async move {
//         let mut interval = interval(interval_duration);
        
//         loop {
//             interval.tick().await;
            
//             {
//                 let state = state.lock().unwrap();
//                 if state.is_none() || !state.as_ref().unwrap().is_running {
//                     break;
//                 }
//             }
            
//             let _ = update_hosts().await;
//         }
//     });
    
//     TIMER_STATE.lock().unwrap().as_mut().unwrap().is_running = true;
    
//     Ok(())
// }

// #[tauri::command]
// pub fn stop_hosts_timer() -> Result<(), ()> {
//     let mut state = TIMER_STATE.lock().unwrap();
//     if state.is_none() {
//         return Err(());
//     }
    
//     state.as_mut().unwrap().is_running = false;
//     Ok(())
// }

// #[tauri::command]
// pub fn delete_hosts_timer() -> Result<(), ()> {
//     let mut state = TIMER_STATE.lock().unwrap();
//     if state.is_none() {
//         return Err(());
//     }
    
//     *state = None;
//     Ok(())
// }
