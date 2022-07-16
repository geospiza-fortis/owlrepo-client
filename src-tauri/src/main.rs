#![cfg_attr(
    all(not(debug_assertions), target_os = "windows"),
    windows_subsystem = "windows"
)]

// https://tauri.app/v1/guides/features/command/
use chrono::prelude::*;
use glob::glob;
use owlrepo_client::crop;
use rayon::prelude::*;
use regex::Regex;
use std::path::Path;

/// Extract the datestring from a MapleLegends screenshot, windows only
fn extract_datestring_from_filename(name: &str) -> Result<String, ()> {
    let re = Regex::new(r"MapleLegends[_ ](.*).png").expect("Invalid regex");
    let caps = re.captures(&name).expect("Unable to get regex captures");
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
    mse: u32,
    crop_x: u32,
    crop_y: u32,
}

#[tauri::command]
fn list_screenshots(
    path: String,
    limit: Option<usize>,
    min_date: Option<DateTime<Local>>,
    exclude_names: Option<Vec<String>>,
) -> Result<Vec<Screenshot>, String> {
    let mut screenshots: Vec<Screenshot> = glob(&format!("{}/*.png", path))
        .expect("Failed to read pattern")
        .map(|p| p.unwrap().to_str().expect("invalid string").into())
        .collect::<Vec<String>>()
        .par_iter()
        .map(|name| {
            let ds = extract_datestring_from_filename(&name).expect("unable to extract datestring");
            let dt = convert_datestring_into_datetime(&ds).expect("unable to convert datestring");
            Screenshot {
                name: name.into(),
                datetime: dt,
                mse: 0,
                crop_x: 0,
                crop_y: 0,
            }
        })
        .filter(|s| {
            // n * m running time complexity, lets go
            if let Some(exclude_names) = &exclude_names {
                exclude_names.contains(&s.name)
            } else {
                true
            }
        })
        .collect();
    // sort in descending order
    screenshots.par_sort_by(|a, b| b.datetime.partial_cmp(&a.datetime).unwrap());

    // filter out dates if we set a threshold
    if let Some(min_date) = min_date {
        screenshots = screenshots
            .into_par_iter()
            .filter(|s| s.datetime >= min_date)
            .collect();
    }

    // limit to the first n screenshots
    if let Some(limit) = limit {
        screenshots = screenshots.into_iter().take(limit).collect();
    }

    screenshots = screenshots
        .into_par_iter()
        .map(|s| {
            let mut img = crop::imread(Path::new(&s.name)).expect("unable to read image");
            let (x, y) = crop::match_owl_header(&img).expect("unable to match");
            // let cropped = crop::crop_owl(&mut img, x, y).expect("unable to crop image");
            let header = crop::crop_header(&mut img, x, y).expect("unable to crop header");
            Screenshot {
                crop_x: x,
                crop_y: y,
                mse: crop::mse(
                    &header,
                    &crop::get_owl_header().expect("unable to get header"),
                ),
                ..s
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
        let datestring = extract_datestring_from_filename(&name).unwrap();
        assert_eq!(datestring, "01-07-2022 20-22-01");
    }

    #[test]
    fn test_convert_datestring_to_datetime() {
        let datestring = "01-07-2022 20-22-01".to_string();
        let dt = convert_datestring_into_datetime(&datestring).unwrap();
        assert_eq!(
            dt.format("%Y-%m-%d %H:%M:%S").to_string(),
            "2022-07-01 20:22:01"
        );
    }
}
