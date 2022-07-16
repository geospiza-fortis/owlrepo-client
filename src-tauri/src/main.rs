#![cfg_attr(
    all(not(debug_assertions), target_os = "windows"),
    windows_subsystem = "windows"
)]

use tauri::{
    api::process::{Command, CommandEvent},
    Manager,
};

// https://github.com/tauri-apps/tauri/blob/dev/examples/sidecar/package.json
fn main() {
    tauri::Builder::default()
        .setup(|app| {
            let window = app.get_window("main").unwrap();
            tauri::async_runtime::spawn(async move {
                let (mut rx, mut child) = Command::new_sidecar("app")
                    .expect("failed to setup `app` sidecar")
                    .spawn()
                    .expect("Failed to spawn packaged node");

                while let Some(event) = rx.recv().await {
                    if let CommandEvent::Stdout(line) = event {
                        window
                            .emit("message", Some(format!("'{}'", line)))
                            .expect("failed to emit event");
                        child.write("message from Rust\n".as_bytes()).unwrap();
                    }
                }
            });

            Ok(())
        })
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
