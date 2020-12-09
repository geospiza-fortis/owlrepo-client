import { dropOutliers } from "./stats.js";

test("drops obvious outlier", () => {
  expect(dropOutliers([1, 2, 3, 100])).toEqual([1, 2, 3]);
});
