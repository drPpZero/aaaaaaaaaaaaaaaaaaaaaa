import { ACTIONS } from "../actions.js";
import { state, selectAction } from "../state.js";

export function renderActionLibrary(container) {
  container.innerHTML = `
    <h2 class="section-heading">Action Library</h2>
    <div class="library-line"></div>
    <div class="category-row">
      <div>Jump</div>
      <div>Spin</div>
      <div>Step/Spiral</div>
    </div>
    <div id="actionGrid" class="action-grid"></div>
  `;

  const grid = container.querySelector("#actionGrid");

  const displayOrder = [
    "toeLoop",      // Jump 1
    "uprightSpin", // Spin 1
    "sideStep",    // Step/Spiral 1
    "splitJump",   // Jump 2
    "sitSpin",     // Spin 2
    "spiral",      // Step/Spiral 2
  ];

  const orderedActions = displayOrder
    .map((id) => ACTIONS.find((action) => action.id === id))
    .filter(Boolean);

  orderedActions.forEach((action) => {
    const card = document.createElement("button");
    card.className = "action-card";
    card.type = "button";

    if (state.selectedActionId === action.id) {
      card.classList.add("selected");
    }

    card.innerHTML = `
      <img class="pose-icon" src="${action.imgPath}" alt="${action.name}" />
      <div class="card-name">${action.name}</div>
      <div class="card-time">${action.requiredTime}s</div>
    `;

    card.draggable = true;
    card.addEventListener("dragstart", (e) => {
      try {
        e.dataTransfer.setData("text/actionId", action.id);
      } catch (err) {
        e.dataTransfer.setData("text/plain", action.id);
      }
    });

    card.addEventListener("click", () => selectAction(action.id));
    grid.appendChild(card);
  });
}

/*
icon svg를 생성하는 함수
로컬 이미지 없이 icon을 사용할 경우, 주석 해제 후 사용
*/
// export function createPoseSvg(type) {
//   const stroke = `stroke="currentColor" stroke-width="6" stroke-linecap="round" stroke-linejoin="round" fill="none"`;
//   const head = (x = 50, y = 16) => `<circle cx="${x}" cy="${y}" r="6" fill="currentColor" />`;

//   const poses = {
//     loop: `
//       ${head(50, 16)}
//       <path ${stroke} d="M50 24 L47 42 L42 62 L36 86" />
//       <path ${stroke} d="M48 38 L30 49" />
//       <path ${stroke} d="M49 42 L66 54" />
//       <path ${stroke} d="M42 62 L56 83" />
//       <path ${stroke} d="M31 88 L42 86" />
//     `,
//     upright: `
//       ${head(50, 14)}
//       <path ${stroke} d="M50 22 L50 58" />
//       <path ${stroke} d="M35 35 C46 30 55 30 66 35" />
//       <path ${stroke} d="M50 58 L39 88" />
//       <path ${stroke} d="M50 58 L61 88" />
//       <path ${stroke} d="M34 88 L66 88" />
//     `,
//     spiral: `
//       ${head(48, 16)}
//       <path ${stroke} d="M48 24 L48 48" />
//       <path ${stroke} d="M48 34 L18 26" />
//       <path ${stroke} d="M48 34 L82 20" />
//       <path ${stroke} d="M48 48 L42 86" />
//       <path ${stroke} d="M50 48 L88 50" />
//       <path ${stroke} d="M35 88 L50 86" />
//     `,
//     split: `
//       ${head(50, 22)}
//       <path ${stroke} d="M50 30 L50 52" />
//       <path ${stroke} d="M50 38 L25 48" />
//       <path ${stroke} d="M50 38 L75 48" />
//       <path ${stroke} d="M50 52 L12 74" />
//       <path ${stroke} d="M50 52 L88 74" />
//       <path ${stroke} d="M8 76 L92 76" />
//     `,
//     sit: `
//       ${head(50, 16)}
//       <path ${stroke} d="M50 24 L46 48 L34 66" />
//       <path ${stroke} d="M47 38 L25 46" />
//       <path ${stroke} d="M48 40 L69 50" />
//       <path ${stroke} d="M34 66 L74 72" />
//       <path ${stroke} d="M33 66 L28 88" />
//       <path ${stroke} d="M25 90 L38 88" />
//     `,
//     side: `
//       ${head(50, 16)}
//       <path ${stroke} d="M50 24 L50 56" />
//       <path ${stroke} d="M50 34 L20 47" />
//       <path ${stroke} d="M50 34 L80 47" />
//       <path ${stroke} d="M50 56 L32 86" />
//       <path ${stroke} d="M50 56 L68 86" />
//       <path ${stroke} d="M26 88 L74 88" />
//     `,
//   };

//   return `<svg class="pose-icon" viewBox="0 0 100 100" aria-hidden="true">${poses[type] ?? poses.side}</svg>`;
// }
