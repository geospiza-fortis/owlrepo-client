#![cfg_attr(
    all(not(debug_assertions), target_os = "windows"),
    windows_subsystem = "windows"
)]

// https://tauri.app/v1/guides/features/command/
use glob::glob;

#[tauri::command]
fn list_screenshots(path: String) -> Result<Vec<String>, String> {
    let screenshots: Vec<String> = glob(&format!("{}/*.png", path))
        .expect("Failed to read pattern")
        .map(|p| p.unwrap().to_str().unwrap().into())
        .collect();
    Ok(screenshots)
}

fn main() {
    tauri::Builder::default()
        .invoke_handler(tauri::generate_handler![list_screenshots])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
