import { initWebGL, renderWebGL, updateAnimation } from "./webgl-engine.js";
import { state } from "../state.js";
import { getActionById, getPlaybackInfo } from "../actions.js";

let canvas = null;
let mode = "edit";

let handleResize = null;

export function createViewer(container, nextMode) {
  mode = nextMode;
  container.innerHTML = "";

  canvas = document.createElement("canvas");
  canvas.style.width = "100%";
  canvas.style.height = "100%";
  container.appendChild(canvas);

  resizeCanvas();
  initWebGL(canvas);

  if (handleResize) {
    window.removeEventListener("resize", handleResize);
  }
  
  handleResize = () => {
    resizeCanvas();
    initWebGL(canvas);
  };
  
  window.addEventListener("resize", handleResize);
}

export function setZoom(direction) {
  // WebGL zoom could be implemented by modifying camera eye or projection
}

export function renderCurrentFrame(action, currentTime = 0) {
  if (!canvas) return;

  let animMode = "sideStep";
  let localTime = currentTime;

  if (state.mode === "play") {
    const info = getPlaybackInfo(state.sequence, currentTime);
    animMode = info.action ? info.action.id : "sideStep";
    localTime = info.localTime;
  } else {
    animMode = action ? action.id : "sideStep";
    localTime = currentTime;
  }

  updateAnimation(animMode, localTime);
  renderWebGL(currentTime, state.mode === "play");
}

function resizeCanvas() {
  if (!canvas) return;

  const rect = canvas.getBoundingClientRect();
  const ratio = window.devicePixelRatio || 1;

  canvas.width = Math.max(1, Math.floor(rect.width * ratio));
  canvas.height = Math.max(1, Math.floor(rect.height * ratio));
}
