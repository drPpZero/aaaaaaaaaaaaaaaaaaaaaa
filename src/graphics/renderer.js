import { drawModel } from "./model.js";
import { createSceneBackground } from "./scene.js";
import { getCameraSettings } from "./camera.js";

let canvas = null;
let context = null;
let mode = "edit";
let zoom = 1;

export function createViewer(container, nextMode) {
  mode = nextMode;
  container.innerHTML = "";

  canvas = document.createElement("canvas");
  container.appendChild(canvas);
  context = canvas.getContext("2d");

  resizeCanvas();
  window.onresize = resizeCanvas;
}

export function setZoom(direction) {
  zoom += direction * 0.1;
  zoom = Math.max(0.7, Math.min(1.8, zoom));
}

export function renderCurrentFrame(action, currentTime = 0) {
  if (!canvas || !context) return;

  resizeCanvas();

  const rect = canvas.getBoundingClientRect();
  const width = rect.width;
  const height = rect.height;

  context.clearRect(0, 0, width, height);
  createSceneBackground(context, width, height, Boolean(action));

  if (!action) {
    context.fillStyle = "rgba(13, 35, 75, 0.38)";
    context.font = `${Math.max(13, width * 0.026)}px Arial`;
    context.textAlign = "center";
    context.fillText("No action selected", width / 2, height / 2);
    return;
  }

  const camera = getCameraSettings(mode);
  drawModel(context, { action, currentTime, width, height, zoom, camera });
}

function resizeCanvas() {
  if (!canvas || !context) return;

  const rect = canvas.getBoundingClientRect();
  const ratio = window.devicePixelRatio || 1;

  canvas.width = Math.max(1, Math.floor(rect.width * ratio));
  canvas.height = Math.max(1, Math.floor(rect.height * ratio));

  context.setTransform(ratio, 0, 0, ratio, 0, 0);
}
