import { state, subscribe, advancePlayback } from "./state.js";
import { renderEditScreen } from "./ui/editScreen.js";
import { renderPlayScreen } from "./ui/playScreen.js";
import { renderCurrentFrame } from "./graphics/renderer.js";
import { getActionById } from "./actions.js";

const app = document.querySelector("#app");

let lastTime = performance.now();

function renderApp() {
  if (state.mode === "edit") {
    renderEditScreen(app);
  } else {
    renderPlayScreen(app);
  }
}

subscribe(renderApp);
renderApp();

function loop(now) {
  const deltaSeconds = (now - lastTime) / 1000;
  lastTime = now;

  advancePlayback(deltaSeconds);

  if (state.mode === "play") {
    const sequenceItem = state.sequence[state.currentActionIndex] ?? state.sequence[0];
    const action = sequenceItem ? getActionById(sequenceItem.actionId) : null;
    renderCurrentFrame(action, state.currentTime);
  }

  requestAnimationFrame(loop);
}

requestAnimationFrame(loop);
