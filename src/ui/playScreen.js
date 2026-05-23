import { state, togglePlayPause, resetPlayback, enterEditMode } from "../state.js";
import { renderSequenceBar } from "./sequenceBar.js";
import { renderTimeBar } from "./timeBar.js";
import { createViewer, renderCurrentFrame } from "../graphics/renderer.js";
import { getActionById } from "../actions.js";

export function renderPlayScreen(root) {
  root.innerHTML = `
    <div class="screen-wrap">
      <main class="screen">
        <div class="header-logo">❄</div>
        <h1 class="header-title">Figure Skating Sequence Planner</h1>
        <button class="play-main-button" type="button" disabled>Play</button>

        <section id="playViewer" class="play-viewer-panel"></section>
        <section id="playSequence" class="play-sequence-area"></section>
        <section id="playTimeControl" class="play-time-control"></section>
        <section id="playControlButtons" class="play-control-buttons"></section>
      </main>
    </div>
  `;

  const sequenceItem = state.sequence[state.currentActionIndex] ?? state.sequence[0];
  const currentAction = sequenceItem ? getActionById(sequenceItem.actionId) : null;

  createViewer(root.querySelector("#playViewer"), "play");
  renderCurrentFrame(currentAction, state.currentTime);

  renderSequenceBar(root.querySelector("#playSequence"), {
    editable: false,
    activeIndex: state.currentActionIndex,
    showTitle: false,
    showTotal: false,
  });

  renderTimeBar(root.querySelector("#playTimeControl"));

  const buttons = root.querySelector("#playControlButtons");

  const playPauseButton = document.createElement("button");
  playPauseButton.className = "dark-button";
  playPauseButton.type = "button";
  playPauseButton.textContent = state.isPlaying ? "Ⅱ  Pause" : "▶  Play";
  playPauseButton.addEventListener("click", togglePlayPause);

  const resetButton = document.createElement("button");
  resetButton.className = "secondary-button";
  resetButton.type = "button";
  resetButton.textContent = "Reset";
  resetButton.addEventListener("click", resetPlayback);

  const editButton = document.createElement("button");
  editButton.className = "secondary-button edit";
  editButton.type = "button";
  editButton.textContent = "Edit Mode";
  editButton.addEventListener("click", enterEditMode);

  buttons.append(playPauseButton, resetButton, editButton);
}
