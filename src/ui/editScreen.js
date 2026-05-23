import { state, tryEnterPlayMode } from "../state.js";
import { getActionById } from "../actions.js";
import { renderActionLibrary } from "./actionLibrary.js";
import { renderActionInfo } from "./actionInfo.js";
import { renderSequenceBar } from "./sequenceBar.js";
import { createViewer, renderCurrentFrame, setZoom } from "../graphics/renderer.js";

export function renderEditScreen(root) {
  const selectedAction = getActionById(state.selectedActionId);

  root.innerHTML = `
    <div class="screen-wrap">
      <main class="screen">
        <div class="header-logo">❄</div>
        <h1 class="header-title">Figure Skating Sequence Planner</h1>
        <button id="playButton" class="play-main-button" type="button">▶&nbsp; Play</button>

        <div id="errorMessage" class="error-message"></div>

        <section class="panel current-action-panel">
          <div class="current-title-row">
            <h2 class="current-title">Current Action: <span>${selectedAction ? selectedAction.name : ""}</span></h2>
            <div class="zoom-control">
              <button id="zoomInButton" class="zoom-button" type="button">＋</button>
              <button id="zoomOutButton" class="zoom-button" type="button">－</button>
            </div>
          </div>
          <div id="currentActionViewer" class="viewer"></div>
        </section>

        <aside id="actionLibrary" class="panel action-library-panel"></aside>
        <div class="decoration"><span>❄</span></div>
        <aside id="actionInfo" class="panel action-info-panel"></aside>
        <section id="sequenceHost" class="panel sequence-panel"></section>
      </main>
    </div>
  `;

  showErrorIfNeeded(root);

  createViewer(root.querySelector("#currentActionViewer"), "edit");
  renderCurrentFrame(selectedAction, 0);

  renderActionLibrary(root.querySelector("#actionLibrary"));
  renderActionInfo(root.querySelector("#actionInfo"));
  renderSequenceBar(root.querySelector("#sequenceHost"), {
    editable: true,
    activeIndex: null,
    showTitle: true,
    showTotal: true,
  });

  root.querySelector("#playButton").addEventListener("click", tryEnterPlayMode);
  root.querySelector("#zoomInButton").addEventListener("click", () => {
    setZoom(1);
    renderCurrentFrame(selectedAction, 0);
  });
  root.querySelector("#zoomOutButton").addEventListener("click", () => {
    setZoom(-1);
    renderCurrentFrame(selectedAction, 0);
  });
}

function showErrorIfNeeded(root) {
  const errorMessage = root.querySelector("#errorMessage");

  if (!state.errorMessage) return;

  errorMessage.textContent = state.errorMessage;
  errorMessage.classList.add("visible");
}
