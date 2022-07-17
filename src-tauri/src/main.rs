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
use std::fs::File;
use std::io::Read;
use std::path::Path;

/// Extract the datestring from a MapleLegends screenshot, windows only
fn extract_datestring_from_filename(name: &str) -> Result<String, ()> {
    let re = Regex::new(r"MapleLegends[_ ](.*).png").expect("Invalid regex");
    let caps = re.captures(&name).expect("Unable to get regex captures");
    Ok(caps.get(1).expect("Invalid filename").as_str().into())
}

// https://docs.rs/chrono/latest/chrono/index.html
fn convert_datestring_into_datetime(ds: &str) -> Result<DateTime<Local>, ()> {
    let naive = NaiveDateTime::parse_from_str(&ds, "%d-%m-%Y %H-%M-%S")
        .expect("could not parse date string");
    let dt: DateTime<Local> = Local.from_local_datetime(&naive).unwrap();
    Ok(dt)
}

#[derive(serde::Serialize, serde::Deserialize)]
struct Screenshot {
    name: String,
    datetime: DateTime<Local>,
    mse: u32,
    crop_x: u32,
    crop_y: u32,
}

fn list_screenshots_sync(
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
                !exclude_names.contains(&s.name)
            } else {
                true
            }
        })
        .filter(|s| {
            if let Some(min_date) = min_date {
                s.datetime >= min_date
            } else {
                true
            }
        })
        .collect();
    // sort in descending order
    screenshots.par_sort_by(|a, b| b.datetime.partial_cmp(&a.datetime).unwrap());

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
            Screenshot {
                crop_x: x,
                crop_y: y,
                mse: crop::mse(
                    &crop::crop_header(&mut img, x, y).expect("unable to crop header"),
                    &crop::get_owl_header().expect("unable to get header"),
                ),
                ..s
            }
        })
        .collect();
    Ok(screenshots)
}

#[tauri::command]
async fn list_screenshots(
    path: String,
    limit: Option<usize>,
    min_date: Option<DateTime<Local>>,
    exclude_names: Option<Vec<String>>,
) -> Result<Vec<Screenshot>, String> {
    list_screenshots_sync(path, limit, min_date, exclude_names)
}

fn get_screenshot_uri_sync(screenshot: Screenshot) -> Result<String, String> {
    let mut img = crop::imread(Path::new(&screenshot.name)).expect("unable to read image");
    let cropped = crop::crop_owl(&mut img, screenshot.crop_x, screenshot.crop_y)
        .expect("unable to crop image");
    let file = tempfile::NamedTempFile::new().expect("cant create tempfile");
    let path = file.into_temp_path();
    crop::imsave_png(path.as_ref(), &cropped).expect("unable to write image");
    // read the file into memory and base64 encode the value
    let mut file = File::open(path).expect("unable to open file");
    let mut contents = Vec::new();
    file.read_to_end(&mut contents)
        .expect("unable to read file");
    let encoded = base64::encode(&contents);
    Ok(format!("data:image/png;base64,{}", encoded))
}

#[tauri::command]
async fn get_screenshot_uri(screenshot: Screenshot) -> Result<String, String> {
    get_screenshot_uri_sync(screenshot)
}

#[tauri::command]
async fn get_screenshot_uri_batch(screenshots: Vec<Screenshot>) -> Result<Vec<String>, String> {
    Ok(screenshots
        .into_par_iter()
        .map(|s| get_screenshot_uri_sync(s).unwrap())
        .collect())
}

fn trash_screenshots_sync(screenshots: Vec<Screenshot>) -> Result<(), String> {
    for s in screenshots {
        // check if path exists
        if Path::new(&s.name).exists() {
            trash::delete(s.name).expect("unable to remove file");
        }
    }
    Ok(())
}

#[tauri::command]
fn trash_screenshots(screenshots: Vec<Screenshot>) -> Result<(), String> {
    trash_screenshots_sync(screenshots)
}

#[tauri::command]
async fn create_cropped_batch(
    screenshots: Vec<Screenshot>,
    base_batch_path: String,
) -> Result<(), String> {
    // make the batch path if it doesn't exist
    std::fs::create_dir_all(&base_batch_path).expect("unable to create batch path");

    // create the directory for batch using the date of the most recent image
    let mut dates = screenshots.iter().map(|s| s.datetime).collect::<Vec<_>>();
    dates.par_sort_by(|a, b| b.partial_cmp(&a).unwrap());
    let ds = &dates[0].to_rfc3339().replace(":", "_");
    let batch_path = format!("{}/{}", base_batch_path, ds);

    // crop images with the batch directory as the final location
    std::fs::create_dir_all(&batch_path)
        .expect(&format!("unable to create batch dir {}", &batch_path));
    screenshots.into_par_iter().for_each(|s| {
        let mut img = crop::imread(Path::new(&s.name)).expect("unable to read image");
        let cropped = crop::crop_owl(&mut img, s.crop_x, s.crop_y).expect("unable to crop image");
        // get the filename from the path
        let filename = Path::new(&s.name).file_name().unwrap().to_str().unwrap();
        let path = format!("{}/{}", batch_path, filename);
        crop::imsave_png(Path::new(&path), &cropped)
            .expect(&format!("unable to write image: {}", &path));
    });
    Ok(())
}

#[derive(serde::Serialize, serde::Deserialize)]
struct Batch {
    name: String,
    datetime: DateTime<Local>,
    items: Vec<Screenshot>,
}

#[tauri::command]
async fn list_batches(base_batch_path: String) -> Result<Vec<Batch>, String> {
    let mut batches: Vec<Batch> = glob(&format!("{}/*", &base_batch_path))
        .expect("Failed to read pattern")
        .map(|p| p.unwrap().to_str().expect("invalid string").into())
        .collect::<Vec<String>>()
        .par_iter()
        .map(|name| {
            let filename = Path::new(&name).file_name().unwrap().to_str().unwrap();
            let dt = DateTime::parse_from_rfc3339(&filename.replace("_", ":"))
                .expect("unable to convert datestring");
            Batch {
                name: name.into(),
                datetime: dt.into(),
                items: Vec::new(),
            }
        })
        .collect();
    // sort in descending order
    batches.par_sort_by(|a, b| b.datetime.partial_cmp(&a.datetime).unwrap());
    let batches = batches
        .into_par_iter()
        .map(|b| Batch {
            items: list_screenshots_sync((&b.name).into(), None, None, None)
                .expect("unable to list files"),
            ..b
        })
        .collect();
    Ok(batches)
}

fn main() {
    tauri::Builder::default()
        .invoke_handler(tauri::generate_handler![
            list_screenshots,
            get_screenshot_uri,
            get_screenshot_uri_batch,
            create_cropped_batch,
            trash_screenshots,
            list_batches
        ])
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
