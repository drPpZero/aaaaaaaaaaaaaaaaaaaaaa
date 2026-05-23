import { parseBVH } from "./bvhParser.js";

const motionCache = new Map();

export async function loadBVH(path) {
  if (motionCache.has(path)) {
    return motionCache.get(path);
  }

  const response = await fetch(path);

  if (!response.ok) {
    throw new Error(`BVH file load failed: ${path}`);
  }

  const text = await response.text();
  const motion = parseBVH(text);

  motionCache.set(path, motion);
  return motion;
}
