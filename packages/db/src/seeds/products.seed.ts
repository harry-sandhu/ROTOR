import { batteryProductBundles } from "./products/batteries.seed.js";
import { escProductBundles } from "./products/escs.seed.js";
import { frameProductBundles } from "./products/frames.seed.js";
import { motorProductBundles } from "./products/motors.seed.js";
import { propellerProductBundles } from "./products/propellers.seed.js";
import { flattenProductBundles } from "./products/shared.js";

export const allProductBundles = [
  ...frameProductBundles,
  ...motorProductBundles,
  ...escProductBundles,
  ...batteryProductBundles,
  ...propellerProductBundles,
];

export const seededProductRows = flattenProductBundles(allProductBundles);

export const seededProductCounts = {
  frames: frameProductBundles.length,
  motors: motorProductBundles.length,
  escs: escProductBundles.length,
  batteries: batteryProductBundles.length,
  propellers: propellerProductBundles.length,
  total: allProductBundles.length,
} as const;
