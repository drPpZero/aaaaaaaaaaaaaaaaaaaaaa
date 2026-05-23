import { getTotalTime } from "../actions.js";
import { state, setCurrentTime } from "../state.js";

export function renderTimeBar(container) {
  const totalTime = getTotalTime(state.sequence);

  container.innerHTML = `
    <div class="time-text">
      <span class="current-time">${formatTime(state.currentTime)}</span>
      <span class="full-time"> / ${formatTime(totalTime)}</span>
    </div>
    <input
      id="timeBar"
      class="time-bar"
      type="range"
      min="0"
      max="${totalTime}"
      step="0.01"
      value="${Math.min(state.currentTime, totalTime)}"
    />
  `;

  container.querySelector("#timeBar").addEventListener("input", (event) => {
    setCurrentTime(Number(event.target.value));
  });
}

function formatTime(seconds) {
  const safeSeconds = Math.max(0, Math.floor(Number(seconds) || 0));
  const minutes = Math.floor(safeSeconds / 60);
  const remainSeconds = safeSeconds % 60;
  return `${String(minutes).padStart(2, "0")}:${String(remainSeconds).padStart(2, "0")}`;
}
