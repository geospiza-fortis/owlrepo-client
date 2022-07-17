import localforage from "localforage";
import { orderBy } from "lodash-es";

const SCREENSHOTS_STORAGE_KEY = "screenshots-listing";
const SCREENSHOTS_BATCH_KEY = "screenshots-listing-batches";

// update our screenshots with a list of screenshots
async function updateScreenshots(screenshots, path = SCREENSHOTS_STORAGE_KEY) {
  // we key each of the objects by their name
  let items = (await localforage.getItem(path)) || {};
  let toUpdate = Object.fromEntries(screenshots.map((s) => [s.name, s]));
  await localforage.setItem(path, { ...items, ...toUpdate });
}

async function getScreenshots(path = SCREENSHOTS_STORAGE_KEY) {
  let items = (await localforage.getItem(path)) || {};
  return orderBy(Object.values(items), ["datetime"], ["desc"]);
}

export {
  SCREENSHOTS_STORAGE_KEY,
  SCREENSHOTS_BATCH_KEY,
  updateScreenshots,
  getScreenshots,
};
