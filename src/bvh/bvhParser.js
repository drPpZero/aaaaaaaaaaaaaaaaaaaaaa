export function parseBVH(text) {
  const lines = text
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter(Boolean);

  const motionStart = lines.findIndex((line) => line.toUpperCase() === "MOTION");

  if (motionStart === -1) {
    throw new Error("Invalid BVH file: MOTION section is missing.");
  }

  const hierarchyLines = lines.slice(0, motionStart);
  const motionLines = lines.slice(motionStart + 1);

  return {
    joints: parseHierarchy(hierarchyLines),
    ...parseMotion(motionLines),
  };
}

function parseHierarchy(lines) {
  const joints = [];
  const stack = [];
  let currentJoint = null;

  for (const line of lines) {
    if (line.startsWith("ROOT ") || line.startsWith("JOINT ")) {
      const [, name] = line.split(/\s+/);
      currentJoint = {
        name,
        parent: stack.length ? stack[stack.length - 1].name : null,
        offset: [0, 0, 0],
        channels: [],
      };
      joints.push(currentJoint);
      continue;
    }

    if (line === "{") {
      if (currentJoint) stack.push(currentJoint);
      continue;
    }

    if (line === "}") {
      stack.pop();
      currentJoint = stack[stack.length - 1] ?? null;
      continue;
    }

    if (line.startsWith("OFFSET ") && currentJoint) {
      currentJoint.offset = line.split(/\s+/).slice(1).map(Number);
      continue;
    }

    if (line.startsWith("CHANNELS ") && currentJoint) {
      const parts = line.split(/\s+/);
      const count = Number(parts[1]);
      currentJoint.channels = parts.slice(2, 2 + count);
    }
  }

  return joints;
}

function parseMotion(lines) {
  const framesLine = lines.find((line) => line.startsWith("Frames:"));
  const frameTimeLine = lines.find((line) => line.startsWith("Frame Time:"));

  if (!framesLine || !frameTimeLine) {
    throw new Error("Invalid BVH file: frame metadata is missing.");
  }

  const frameCount = Number(framesLine.split(":")[1].trim());
  const frameTime = Number(frameTimeLine.split(":")[1].trim());
  const frameDataStart = lines.findIndex((line) => line.startsWith("Frame Time:")) + 1;

  const frames = lines.slice(frameDataStart).map((line) => line.split(/\s+/).map(Number));

  return {
    frameCount,
    frameTime,
    frames,
    duration: frameCount * frameTime,
  };
}
