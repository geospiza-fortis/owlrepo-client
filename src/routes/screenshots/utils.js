function extractName(screenshot) {
  return /MapleLegends[_ ](.*).png/.exec(screenshot.name)[0];
}

export { extractName };
