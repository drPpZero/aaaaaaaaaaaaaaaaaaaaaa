import { getActionById, getTotalTime } from "../actions.js";
import { state, deleteSequenceItem, insertActionAt } from "../state.js";

export function renderSequenceBar(container, options = {}) {
  const {
    editable = false,
    activeIndex = null,
    showTitle = true,
    showTotal = true,
  } = options;

  // 기존 Sequence Bar 내용을 초기화한 뒤 다시 렌더링
  container.innerHTML = "";

  if (showTitle) {
    const title = document.createElement("h2");
    title.className = "sequence-title";
    title.textContent = "Sequence";
    container.appendChild(title);
  }

  const scroll = document.createElement("div");
  scroll.className = "sequence-scroll";

  const row = document.createElement("div");
  row.className = "sequence-row";

  // Action Library에서 드래그한 action을 Sequence 영역에 놓을 수 있도록 설정
  row.addEventListener("dragover", (e) => {
    e.preventDefault();
  });

  row.addEventListener("drop", (e) => {
    e.preventDefault();

    let actionId = null;

    // 드래그 데이터에서 action id를 가져옴
    try {
      actionId = e.dataTransfer.getData("text/actionId");
    } catch (err) {
      actionId = e.dataTransfer.getData("text/plain");
    }

    if (!actionId) return;

    // 특정 sequence card 위에 drop하면 해당 위치에 삽입
    const targetCard = e.target.closest(".sequence-card");
    let insertIndex = state.sequence.length;

    if (targetCard) {
      const numEl = targetCard.querySelector(".sequence-number");
      if (numEl) {
        const idx = parseInt(numEl.textContent, 10);
        if (!Number.isNaN(idx)) insertIndex = idx - 1;
      }
    }

    insertActionAt(actionId, insertIndex);
  });

  if (state.sequence.length === 0) {
    // sequence가 비어 있을 때 표시할 안내 문구
    const empty = document.createElement("div");
    empty.className = "sequence-empty";
    empty.textContent = "No action in sequence";
    row.appendChild(empty);
  } else {
    // sequence에 포함된 action들을 카드 형태로 렌더링
    state.sequence.forEach((sequenceItem, index) => {
      const action = getActionById(sequenceItem.actionId);
      if (!action) return;

      const card = document.createElement("div");
      card.className = "sequence-card";

      if (!editable) card.classList.add("readonly");
      if (index === activeIndex) card.classList.add("active");

      card.innerHTML = `
        <div class="sequence-number">${index + 1}</div>
        <img class="sequence-icon-img" src="${action.imgPath}" alt="${action.name}" />
        <div class="card-name">${action.name}</div>
        <div class="card-time">${action.requiredTime}s</div>
      `;

      // 편집 가능한 상태일 때만 삭제 버튼 표시
      if (editable) {
        const deleteButton = document.createElement("button");
        deleteButton.className = "delete-button";
        deleteButton.type = "button";
        deleteButton.textContent = "×";
        deleteButton.addEventListener("click", () => deleteSequenceItem(sequenceItem.instanceId));
        card.appendChild(deleteButton);
      }

      row.appendChild(card);
    });
  }

  scroll.appendChild(row);
  container.appendChild(scroll);

  // 전체 sequence 실행 시간을 표시
  if (showTotal) {
    const totalRow = document.createElement("div");
    totalRow.className = "total-row";
    totalRow.innerHTML = `
      <span>Total Time</span>
      <span class="total-time">${getTotalTime(state.sequence).toFixed(1)}s</span>
      <span class="total-note">Transitions usually take three seconds, except after jump actions.</span>
    `;
    container.appendChild(totalRow);
  }
}