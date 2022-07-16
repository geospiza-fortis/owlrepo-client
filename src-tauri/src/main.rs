#![cfg_attr(
    all(not(debug_assertions), target_os = "windows"),
    windows_subsystem = "windows"
)]

// https://tauri.app/v1/guides/features/command/
use chrono::prelude::*;
use glob::glob;
use regex::Regex;

/// Extract the datestring from a MapleLegends screenshot, windows only
fn extract_datestring_from_filename(name: &str) -> Result<String, ()> {
    let re = Regex::new(r"MapleLegends[_ ](.*).png").unwrap();
    let caps = re.captures(&name).unwrap();
    Ok(caps.get(1).expect("Invalid filename").as_str().into())
}

// https://docs.rs/chrono/latest/chrono/index.html
fn convert_datestring_into_datetime(ds: &str) -> Result<DateTime<Local>, ()> {
    let naive = NaiveDateTime::parse_from_str(&ds, "%d-%m-%Y %H-%M-%S").unwrap();
    let dt: DateTime<Local> = Local.from_local_datetime(&naive).unwrap();
    Ok(dt)
}

#[derive(serde::Serialize)]
struct Screenshot {
    name: String,
    datetime: DateTime<Local>,
}

#[tauri::command]
fn list_screenshots(path: String) -> Result<Vec<Screenshot>, String> {
    let screenshots: Vec<Screenshot> = glob(&format!("{}/*.png", path))
        .expect("Failed to read pattern")
        .map(|p| p.unwrap().to_str().unwrap().into())
        .map(|name: String| {
            let ds = extract_datestring_from_filename(&name).unwrap();
            let dt = convert_datestring_into_datetime(&ds).unwrap();
            Screenshot {
                name: name.into(),
                datetime: dt,
            }
        })
        .collect();
    Ok(screenshots)
}

fn main() {
    tauri::Builder::default()
        .invoke_handler(tauri::generate_handler![list_screenshots])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_extract_datestring_from_filename() {
        let name = "MapleLegends 01-07-2022 20-22-01.png".to_string();
        let datestring = extract_datestring_from_filename(name).unwrap();
        assert_eq!(datestring, "01-07-2022 20-22-01");
    }

    #[test]
    fn test_convert_datestring_to_datetime() {
        let datestring = "01-07-2022 20-22-01".to_string();
        let dt = convert_datestring_into_datetime(datestring).unwrap();
        assert_eq!(
            dt.format("%Y-%m-%d %H:%M:%S").to_string(),
            "2022-07-01 20:22:01"
        );
    }
}
