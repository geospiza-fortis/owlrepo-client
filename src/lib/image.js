// Convert the cropped image urls into blobs for upload
// https://stackoverflow.com/a/11954337

import convolve from "convolve";

const validationHeaderUrl =
  "data:image/png;base64,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";

function dataURItoBlob(dataURI) {
  const binary = atob(dataURI.split(",")[1]);
  const array = [];
  for (let i = 0; i < binary.length; i++) {
    array.push(binary.charCodeAt(i));
  }
  return new Blob([new Uint8Array(array)], { type: "image/png" });
}

// https://simon-schraeder.de/posts/filereader-async/
async function readDataAsync(file) {
  return new Promise((resolve, reject) => {
    let reader = new FileReader();
    reader.onload = () => resolve(reader.result);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

// TODO: hack, fix this later
async function readImageAsync(dataUrl) {
  return new Promise((resolve, _) => {
    let img = new Image();
    img.onload = () => {
      resolve(img);
    };
    img.src = dataUrl;
  });
}

function canvasFromImage(dataUrl) {
  return new Promise((resolve, _) => {
    let canvas = document.createElement("canvas");
    let context = canvas.getContext("2d");
    let img = new Image();
    img.onload = () => {
      canvas.width = img.width;
      canvas.height = img.height;
      context.drawImage(img, 0, 0);
      resolve(canvas);
    };
    img.src = dataUrl;
  });
}

async function validateOwl(dataUrl, threshold = 100, verbose = false) {
  let canvas = await canvasFromImage(dataUrl);
  let validationCanvas = await canvasFromImage(validationHeaderUrl);

  let edges = [
    [0, -1, 0],
    [-1, 4, -1],
    [0, -1, 0],
  ];
  convolve(edges).canvas(validationCanvas);
  convolve(edges).canvas(canvas);

  let params = [0, 0, validationCanvas.width, validationCanvas.height];
  let data = canvas.getContext("2d").getImageData(...params).data;
  let validationData = validationCanvas
    .getContext("2d")
    .getImageData(...params).data;

  if (verbose) {
    console.log(canvas.toDataURL());
  }

  if (data.length != validationData.length) {
    console.log("bad size");
    return false;
  }

  // now check that the brightness is within tolerance
  function luma(data, i) {
    return data[i] * 0.2126 + data[i + 1] * 0.7152 + data[i + 2] * 0.0722;
  }

  let acc = 0;
  for (let i = 0; i < data.length; i += 4) {
    acc += Math.pow(luma(data, i) - luma(validationData, i), 2);
  }
  let diff = acc / (data.length / 4);
  if (verbose) {
    console.log(diff);
  }
  return diff < threshold;
}

async function cropImage(dataUrl, y0, y1, x0, x1) {
  let srcCanvas = await canvasFromImage(dataUrl);
  let destCanvas = document.createElement("canvas");
  let width = x1 - x0;
  let height = y1 - y0;
  destCanvas.width = width;
  destCanvas.height = height;
  let destContext = destCanvas.getContext("2d");

  destContext.drawImage(srcCanvas, x0, y0, width, height, 0, 0, width, height);
  return destCanvas.toDataURL();
}

// this will cause the aspect ratio to be funky if the target is not the same
async function resizeImage(dataUrl, width, height) {
  let srcCanvas = await canvasFromImage(dataUrl);
  let destCanvas = document.createElement("canvas");
  let destContext = destCanvas.getContext("2d");
  destCanvas.width = width;
  destCanvas.height = height;
  destContext.drawImage(
    srcCanvas,
    // 0,
    // 0,
    // srcCanvas.width,
    // srcCanvas.height,
    0,
    0,
    width,
    height,
  );
  return destCanvas.toDataURL();
}

export {
  cropImage,
  resizeImage,
  readDataAsync,
  readImageAsync,
  dataURItoBlob,
  validateOwl,
};
