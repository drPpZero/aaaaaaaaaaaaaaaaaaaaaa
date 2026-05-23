export function getCameraSettings(mode) {
  if (mode === "play") {
    return {
      centerXRatio: 0.38,
      centerYRatio: 0.54,
      scaleRatio: 0.22,
    };
  }

  return {
    centerXRatio: 0.50,
    centerYRatio: 0.54,
    scaleRatio: 0.30,
  };
}
