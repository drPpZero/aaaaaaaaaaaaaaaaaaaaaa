export function createSceneBackground(ctx, width, height, hasAction) {
  if (!hasAction) {
    ctx.fillStyle = "#E4EAED";
    ctx.fillRect(0, 0, width, height);
    return;
  }

  const gradient = ctx.createLinearGradient(0, 0, 0, height);
  gradient.addColorStop(0, "rgba(183, 201, 227, 0.78)");
  gradient.addColorStop(0.68, "rgba(249, 251, 252, 0.97)");
  gradient.addColorStop(1, "rgba(228, 234, 237, 1)");

  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, width, height);

  drawRinkLine(ctx, width, height);
  drawIceScratches(ctx, width, height);
  drawSnow(ctx, width, height);
}

function drawRinkLine(ctx, width, height) {
  ctx.save();
  ctx.strokeStyle = "rgba(255, 255, 255, 0.75)";
  ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.arc(width * 0.55, height * 0.86, width * 0.72, Math.PI * 1.08, Math.PI * 1.94);
  ctx.stroke();
  ctx.restore();
}

function drawIceScratches(ctx, width, height) {
  ctx.save();
  ctx.strokeStyle = "rgba(13, 35, 75, 0.08)";
  ctx.lineWidth = 1;

  for (let i = 0; i < 18; i += 1) {
    const y = height * 0.62 + i * 18;
    ctx.beginPath();
    ctx.moveTo(0, y);
    ctx.lineTo(width, y + Math.sin(i) * 10);
    ctx.stroke();
  }

  ctx.restore();
}

function drawSnow(ctx, width, height) {
  ctx.save();
  ctx.fillStyle = "rgba(255, 255, 255, 0.52)";

  for (let i = 0; i < 22; i += 1) {
    const x = (i * 139) % width;
    const y = 24 + ((i * 61) % Math.max(80, height * 0.38));
    ctx.beginPath();
    ctx.arc(x, y, 2 + (i % 3), 0, Math.PI * 2);
    ctx.fill();
  }

  ctx.restore();
}
