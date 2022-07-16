use image::{imageops, io, ImageBuffer, ImageError, ImageFormat, Rgba, RgbaImage};
use ndarray::{stack, Array2, ArrayBase, Axis, ViewRepr};
use nshare::ToNdarray2;
use rustfft::{num_complex::Complex, FftDirection, FftPlanner};
use std::io::Cursor;
use std::path::Path;

pub type Image = ImageBuffer<Rgba<u8>, Vec<u8>>;

fn path_as_string(path: &Path) -> String {
    path.to_path_buf().into_os_string().into_string().unwrap()
}

pub fn imread(source: &Path) -> Result<Image, ImageError> {
    Ok(io::Reader::open(&path_as_string(source))?
        .with_guessed_format()?
        .decode()?
        .into_rgba8())
}

pub fn imsave(output: &Path, img: &Image) -> Result<(), ImageError> {
    img.save(output)
}

pub fn imsave_png(output: &Path, img: &Image) -> Result<(), ImageError> {
    img.save_with_format(output, ImageFormat::Png)
}

// header is 435 x 25 pixels
pub fn get_owl_header() -> Result<Image, ImageError> {
    let reference_bytes = include_bytes!("assets/owl_header.png");
    Ok(io::Reader::new(Cursor::new(reference_bytes))
        .with_guessed_format()?
        .decode()?
        .into_rgba8())
}

fn into_grayscale_array(img: &Image) -> Array2<u8> {
    imageops::colorops::grayscale(img).into_ndarray2()
}

fn column_fft(
    array: &mut Array2<Complex<f32>>,
    planner: &mut FftPlanner<f32>,
    direction: FftDirection,
) {
    // gross, since we end up creating a new array that's transposed...
    let plan = match direction {
        FftDirection::Forward => planner.plan_fft_forward(array.dim().0),
        FftDirection::Inverse => planner.plan_fft_inverse(array.dim().0),
    };
    let mut cols = Vec::new();
    for j in 0..array.dim().1 {
        let mut selected = array.t().select(Axis(0), &[j]);
        plan.process(selected.row_mut(0).as_slice_mut().unwrap());
        cols.push(selected);
    }
    let stacked: Vec<ArrayBase<ViewRepr<&_>, _>> = cols.iter().map(|r| r.row(0)).collect();
    *array = stack(Axis(0), stacked.as_slice()).unwrap();
}

/// Take the 1d fft of each row, and then the 1d fft of each column
fn fft2d(array: &mut Array2<Complex<f32>>) {
    let mut planner = FftPlanner::<f32>::new();
    // row x col, we want to run the fft with column size
    let fft_row = planner.plan_fft_forward(array.dim().1);
    for mut row in array.rows_mut() {
        fft_row.process(row.as_slice_mut().unwrap());
    }
    column_fft(array, &mut planner, FftDirection::Forward);
}

/// Reverse of fft, by inverting columns then rows
fn ifft2d(array: &mut Array2<Complex<f32>>) {
    // we make an assumption that the data is already in column-major form due
    // to the use of fft2d.
    let mut planner = FftPlanner::<f32>::new();
    let fft_row = planner.plan_fft_inverse(array.dim().1);
    for mut row in array.rows_mut() {
        fft_row.process(row.as_slice_mut().unwrap());
    }
    column_fft(array, &mut planner, FftDirection::Inverse);
}

/// Run the phase correlation algorithm, and return the value into the original
/// image: https://stackoverflow.com/a/32664730
fn phase_correlate(img: &mut Array2<Complex<f32>>, reference: &mut Array2<Complex<f32>>) {
    fft2d(img);
    fft2d(reference);
    // https://stackoverflow.com/a/41207820
    for (lhs, rhs) in img.iter_mut().zip(reference.iter_mut()) {
        let x = *lhs * rhs.conj();
        *lhs = x / x.norm();
    }
    ifft2d(img);
}

// pad the first image with zeros until it matches the size of the reference
pub fn pad_image(img: &Image, reference: &Image) -> Image {
    let mut background = RgbaImage::new(reference.width(), reference.height());
    imageops::overlay(&mut background, img, 0, 0);
    background
}

pub fn match_owl_header(img: &Image) -> Result<(u32, u32), ImageError> {
    // pad the reference with the original image
    let reference = pad_image(&get_owl_header()?, img);
    let mut gray_ref = into_grayscale_array(&reference).mapv(|x| Complex::new(x as f32, 0.0));
    let mut gray_img = into_grayscale_array(img).mapv(|x| Complex::new(x as f32, 0.0));
    phase_correlate(&mut gray_img, &mut gray_ref);
    let mut maxpos = (0, 0);
    let mut candidate = 0.0;
    for (pos, cell) in gray_img.indexed_iter() {
        let normed = cell.norm();
        if normed > candidate {
            candidate = normed;
            maxpos = pos;
        }
    }
    Ok((maxpos.1 as u32, maxpos.0 as u32))
}

pub fn crop_owl(img: &mut Image, x: u32, y: u32) -> Result<Image, ImageError> {
    let (height, width) = (380, 435);
    Ok(imageops::crop(img, x, y, width, height).to_image())
}

pub fn crop_header(img: &mut Image, x: u32, y: u32) -> Result<Image, ImageError> {
    let (height, width) = (25, 435);
    Ok(imageops::crop(img, x, y, width, height).to_image())
}

pub fn mse(img: &Image, reference: &Image) -> u32 {
    let gray_img = into_grayscale_array(img);
    let gray_ref = into_grayscale_array(reference);

    // calculatinng mse
    let acc: i32 = gray_img
        .iter()
        .zip(gray_ref.iter())
        .map(|(x, y)| (*x as i32 - *y as i32).pow(2))
        .sum();
    let denom = img.width() * img.height();
    return (acc / denom as i32) as u32;
}
