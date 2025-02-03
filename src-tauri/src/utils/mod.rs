pub mod system;
pub mod translate;
pub mod window;
use std::ptr::null_mut;
use winapi::um::{
    processthreadsapi::{GetCurrentProcess, OpenProcessToken},
    securitybaseapi::GetTokenInformation,
    winnt::{TokenElevation, HANDLE, TOKEN_ELEVATION, TOKEN_QUERY},
};

pub fn is_running_as_admin() -> bool {
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
