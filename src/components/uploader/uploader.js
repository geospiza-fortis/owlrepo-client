import localforage from "localforage";
import {
  cropImage,
  resizeImage,
  validateOwl,
  readImageAsync,
} from "../../image.js";
import moment from "moment";

function validateFilename(filename) {
  let re = /MapleLegends[_ ](.*).png/;
  let results = re.exec(filename);
  if (!results || results.length != 2) {
    // does not match
    return false;
  }
  let date = moment(results[1].replace(/_/g, " "), "DD-MM-YYYY hh-mm-ss");
  // we could just end it with date.isValid...
  // Start of MapleLegends was April 1, 2020
  return date.isBetween(moment("2015-04-01"), moment().add(1, "day"));
}

// TODO: add rigorous testing of some kind...
function validateFilenameMac(filename) {
  let re = /Screen[ _]Shot[_ ](.*).png/;
  let results = re.exec(filename);
  if (!results || results.length != 2) {
    return false;
  }
  let target = results[1].replace(/_/g, " ");
  // local AM/PM mode, ensure that this is being parsed strictly
  let date = moment(target, "YYYY-MM-DD at h.mm.ss A", true);
  if (!date.isValid()) {
    // try again in 24 hour mode
    date = moment(target, "YYYY-MM-DD at HH.mm.ss", true);
    if (!date.isValid) {
      console.log("Not a mac date in AM/PM or 24 hour format");
      return false;
    }
  }
  return date.isBetween(moment("2015-04-01"), moment().add(1, "day"));
}

async function parseFile(filename, dataUrl) {
  if (!validateFilename(filename) && !validateFilenameMac(filename)) {
    throw `${filename}: bad filename`;
  }

  let uncropped = await readImageAsync(dataUrl);
  let cropDim;
  let getDim = (x, y) => {
    return [x, x + 380, y, y + 435];
  };
  if (uncropped.height == 600 && uncropped.width == 800) {
    cropDim = getDim(131, 182);
  } else if (uncropped.height == 768 && uncropped.width == 1024) {
    cropDim = getDim(215, 294);
  } else if (uncropped.height == 768 && uncropped.width == 1366) {
    cropDim = getDim(215, 465);
  } else if (uncropped.height == 380 && uncropped.width == 435) {
    cropDim = getDim(0, 0);
  } else if (uncropped.height % 734 == 0 && uncropped.width % 912 == 0) {
    if (uncropped.width != 912) {
      dataUrl = await resizeImage(dataUrl, 912, 734);
    }
    // if the resize is a no-op, then add a 6 pixel offset for whatever
    // reason. See the notebook for details on cropping.
    cropDim = getDim(185 + (uncropped.width == 912 ? 6 : 0), 238);
  } else if (uncropped.height == 1804 && uncropped.width == 2272) {
    // NOTE: I've only tested this on a personal macbook, so I haven't taken
    // into account retina displays, etc. The logic may look the same as above.
    dataUrl = await resizeImage(dataUrl, 1136, 902);
    cropDim = getDim(269, 350);
  } else if (uncropped.height == 902 && uncropped.width == 1136) {
    cropDim = getDim(269, 350);
  } else {
    throw `${filename}: bad dimensions for file`;
  }

  let img = await cropImage(dataUrl, ...cropDim);
  if (!(await validateOwl(img))) {
    throw `${filename}: bad image`;
  }
  return { img: img, name: filename, selected: false };
}

async function updatePersonalUploads(task_id) {
  // This key is used in multiple places
  let uploads = (await localforage.getItem("personal-uploads")) || [];
  uploads.push({ task_id: task_id, timestamp: moment().format() });
  await localforage.setItem("personal-uploads", uploads);
}

export { parseFile, updatePersonalUploads };
