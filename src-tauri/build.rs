use std::fs::File;
use std::io::Read;
use std::io::Write;

const VERSION: &str = "v16.16.0";

// https://stackoverflow.com/questions/50471218/how-to-unzip-a-reqwest-hyper-response-using-streams
// https://stackoverflow.com/questions/31192956/whats-the-de-facto-way-of-reading-and-writing-files-in-rust-1-x
fn download_node_zip() {
    if std::path::Path::new("target/node.exe").exists() {
        return;
    }
    let mut tmpfile = tempfile::tempfile().unwrap();
    println!("{:#?}", tmpfile);
    reqwest::blocking::get(format!(
        "https://nodejs.org/dist/{VERSION}/node-{VERSION}-win-x64.zip"
    ))
    .unwrap()
    .copy_to(&mut tmpfile)
    .unwrap();
    let mut zip = zip::ZipArchive::new(tmpfile).unwrap();
    // write the node file to the target directory
    let mut file = match zip.by_name(format!("node-{VERSION}-win-x64/node.exe").as_str()) {
        Ok(file) => file,
        Err(..) => panic!("node not found in zip"),
    };
    let mut contents = Vec::new();
    file.read_to_end(&mut contents).unwrap();
    let mut output_file = File::create("target/node.exe").unwrap();
    output_file.write_all(&contents).unwrap();
    // copy file with version
    let mut output_file = File::create("target/node.exe-x86_64-pc-windows-msvc.exe").unwrap();
    output_file.write_all(&contents).unwrap();
}

fn main() {
    download_node_zip();
    tauri_build::build();
}
