export function drawModel(ctx, options) {
  const { action, currentTime, width, height, zoom, camera } = options;

  const centerX = width * camera.centerXRatio;
  const centerY = height * camera.centerYRatio;
  const scale = Math.min(width, height) * camera.scaleRatio * zoom;
  const phase = Math.sin(currentTime * 3);

  const pose = getPose(action.iconPath, phase);

  ctx.save();
  ctx.translate(centerX, centerY);
  ctx.scale(scale / 100, scale / 100);

  drawShadow(ctx);
  drawLimb(ctx, pose.body[0], pose.body[1], pose.body[2], pose.body[3], 13);
  drawLimb(ctx, pose.leftArm[0], pose.leftArm[1], pose.leftArm[2], pose.leftArm[3], 7);
  drawLimb(ctx, pose.rightArm[0], pose.rightArm[1], pose.rightArm[2], pose.rightArm[3], 7);
  drawLimb(ctx, pose.leftLeg[0], pose.leftLeg[1], pose.leftLeg[2], pose.leftLeg[3], 9);
  drawLimb(ctx, pose.rightLeg[0], pose.rightLeg[1], pose.rightLeg[2], pose.rightLeg[3], 9);

  drawJoint(ctx, pose.body[0], pose.body[1], 13);
  drawJoint(ctx, pose.body[2], pose.body[3], 11);
  drawHead(ctx, pose.head[0], pose.head[1]);

  ctx.restore();
}

/**
 * BVH integration point:
 * replace drawModel() with a real skeleton renderer or expose a model adapter:
 *
 * export function createModel() {
 *   return { root, joints, resetPose() {}, applyPose(pose) {} };
 * }
 */

function getPose(type, phase) {
  const wiggle = phase * 5;

  switch (type) {
    case "spiral":
      return {
        head: [-2, -64],
        body: [0, -48, 0, 8],
        leftArm: [0, -34, -60, -48 + wiggle],
        rightArm: [0, -34, 66, -62 - wiggle],
        leftLeg: [0, 8, -8, 80],
        rightLeg: [0, 8, 92, 8 + wiggle],
      };
    case "split":
      return {
        head: [0, -56],
        body: [0, -40, 0, 4],
        leftArm: [0, -26, -50, -12],
        rightArm: [0, -26, 50, -12],
        leftLeg: [0, 4, -80, 48 + wiggle],
        rightLeg: [0, 4, 80, 48 - wiggle],
      };
    case "sit":
      return {
        head: [0, -56],
        body: [0, -42, -18, 6],
        leftArm: [-6, -24, -62, -8],
        rightArm: [-6, -24, 52, 0],
        leftLeg: [-18, 6, -42, 70],
        rightLeg: [-18, 6, 72, 32 + wiggle],
      };
    case "upright":
      return {
        head: [0, -66],
        body: [0, -50, 0, 16],
        leftArm: [0, -32, -52, -28 + wiggle],
        rightArm: [0, -32, 52, -28 - wiggle],
        leftLeg: [0, 16, -20, 82],
        rightLeg: [0, 16, 20, 82],
      };
    case "loop":
      return {
        head: [0, -64],
        body: [0, -48, -10, 16],
        leftArm: [-4, -34, -50, -18],
        rightArm: [-4, -34, 44, -6],
        leftLeg: [-10, 16, -38, 86],
        rightLeg: [-10, 16, 38, 76 + wiggle],
      };
    case "side":
    default:
      return {
        head: [0, -62],
        body: [0, -46, 0, 16],
        leftArm: [0, -30, -60, -4],
        rightArm: [0, -30, 60, -4],
        leftLeg: [0, 16, -38, 84],
        rightLeg: [0, 16, 38, 84],
      };
  }
}

function drawLimb(ctx, x1, y1, x2, y2, lineWidth) {
  const gradient = ctx.createLinearGradient(x1, y1, x2, y2);
  gradient.addColorStop(0, "#E4EAED");
  gradient.addColorStop(0.5, "#B7C9E3");
  gradient.addColorStop(1, "#F9FBFC");

  ctx.strokeStyle = gradient;
  ctx.lineWidth = lineWidth;
  ctx.lineCap = "round";
  ctx.beginPath();
  ctx.moveTo(x1, y1);
  ctx.lineTo(x2, y2);
  ctx.stroke();

  ctx.strokeStyle = "#3E82FF";
  ctx.lineWidth = Math.max(2, lineWidth * 0.28);
  const markerX = x1 * 0.45 + x2 * 0.55;
  const markerY = y1 * 0.45 + y2 * 0.55;
  ctx.beginPath();
  ctx.moveTo(markerX - 6, markerY);
  ctx.lineTo(markerX + 6, markerY);
  ctx.stroke();
}

function drawJoint(ctx, x, y, radius) {
  ctx.fillStyle = "#E4EAED";
  ctx.beginPath();
  ctx.arc(x, y, radius, 0, Math.PI * 2);
  ctx.fill();
}

function drawHead(ctx, x, y) {
  ctx.fillStyle = "#F9FBFC";
  ctx.beginPath();
  ctx.arc(x, y, 15, 0, Math.PI * 2);
  ctx.fill();
}

function drawShadow(ctx) {
  ctx.fillStyle = "rgba(13, 35, 75, 0.10)";
  ctx.beginPath();
  ctx.ellipse(18, 92, 120, 18, 0, 0, Math.PI * 2);
  ctx.fill();
}
