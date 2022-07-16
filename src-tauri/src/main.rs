#![cfg_attr(
    all(not(debug_assertions), target_os = "windows"),
    windows_subsystem = "windows"
)]

use tauri::{api::process::Command, window::WindowBuilder, WindowUrl};

// https://github.com/tauri-apps/tauri/blob/dev/examples/sidecar/package.json
// https://github.com/tauri-apps/tauri-plugin-localhost
fn main() {
    let port = portpicker::pick_unused_port().expect("failed to find unused port");
    tauri::Builder::default()
        .plugin(tauri_plugin_localhost::Builder::new(port).build())
        .setup(move |app| {
            if !cfg!(debug_assertions) {
                tauri::async_runtime::spawn(async move {
                    Command::new_sidecar("owlrepo-localhost")
                        .expect("failed to setup `owlrepo-localhost` sidecar")
                        .args([format!("{}", port)])
                        .spawn()
                        .expect("Failed to spawn packaged node");
                });
                WindowBuilder::new(
                    app,
                    "main".to_string(),
                    WindowUrl::External(format!("http://localhost:{}", port).parse().unwrap()),
                )
                .title("Localhost Example")
                .build()?;
            }
            Ok(())
        })
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
