import { median, medianAbsoluteDeviation } from "simple-statistics";

// https://eurekastatistics.com/using-the-median-absolute-deviation-to-find-outliers/
function calculateModifiedZScore(data, constant = 2 * Math.sqrt(3)) {
  let med = median(data);
  let mad = constant * medianAbsoluteDeviation(data);
  let scores = data.map((item) => Math.abs(item - med) / mad);
  return scores;
}

// Outliers are based on the median absolute deviation
function dropOutliers(data, cutoff = 3) {
  if (data.length < 2) {
    return data;
  }
  let scores = calculateModifiedZScore(data);
  let filtered = data.filter((_, index) => scores[index] < cutoff);
  if (filtered.length < 1) {
    console.log(
      "dropping outliers removes all data points, returning original values"
    );
    return data;
  }
  return filtered;
}

export { calculateModifiedZScore, dropOutliers };
