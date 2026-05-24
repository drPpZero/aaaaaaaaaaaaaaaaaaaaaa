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

    const timeBar = document.querySelector("#timeBar");
    const timeText = document.querySelector(".current-time");
    if (timeBar) timeBar.value = state.currentTime;
    if (timeText) {
      const minutes = Math.floor(state.currentTime / 60);
      const seconds = Math.floor(state.currentTime % 60);
      timeText.textContent = `${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`;
    }

    const cards = document.querySelectorAll(".sequence-card");
    cards.forEach((card, idx) => {
      if (idx === state.currentActionIndex) card.classList.add("active");
      else card.classList.remove("active");
    });

  } else if (state.mode === "edit" && state.selectedActionId) {
    const action = getActionById(state.selectedActionId);
    renderCurrentFrame(action, state.previewTime);
  }

  requestAnimationFrame(loop);
}

requestAnimationFrame(loop);
