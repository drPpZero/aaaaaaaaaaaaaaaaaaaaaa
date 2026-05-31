import { getActionById } from "../actions.js";
import { state, appendSelectedAction } from "../state.js";

/*
Action Information
*/
export function renderActionInfo(container) {
  const selectedAction = getActionById(state.selectedActionId);

  if (!selectedAction) {
    container.innerHTML = `
      <h2 class="action-info-title">Action Information</h2>
      <div class="info-empty">Select an action</div>
      <button class="append-button" type="button" disabled>+ Append in Sequence</button>
    `;
    return;
  }

  container.innerHTML = `
    <h2 class="action-info-title">Action Information</h2>
    <div class="info-card">
      <div class="info-main">
        <div class="info-icon-circle">
          <img class="info-icon-img" src="${selectedAction.imgPath}" alt="${selectedAction.name}" />
        </div>
        <div>
          <h3 class="info-name">${selectedAction.name}</h3>
          <p class="info-description">${selectedAction.description}</p>
          <div class="required-time">Required Time: ${selectedAction.requiredTime}s</div>
        </div>
      </div>

      <div class="info-meta">
        <div>
          <div class="meta-label">Predicted difficulty</div>
          <div class="meta-value">${selectedAction.difficulty}</div>
        </div>
        <div>
          <div class="meta-label">Category</div>
          <div class="meta-value">${selectedAction.category}</div>
        </div>
      </div>
    </div>

    <button id="appendButton" class="append-button" type="button">+ Append in Sequence</button>
  `;

  const appendButton = container.querySelector("#appendButton");
  appendButton.addEventListener("click", appendSelectedAction);
}