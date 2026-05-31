// 사용자가 선택하거나 시퀀스에 추가할 수 있는 동작 목록
export const ACTIONS = [
  {
    id: "sideStep",
    name: "Side Step",
    category: "Step / Spiral",
    requiredTime: 4,
    difficulty: "Low",
    description: "Basic side step motion",
    iconPath: "side",
    imgPath: "img/side-step.png"
  },
  {
    // 점프 이후 자연스러운 착지를 위해 자동으로 삽입되는 전환 동작
    id: "landingStep",
    name: "Landing Step",
    category: "Transition",
    requiredTime: 0.8,
    difficulty: "Low",
    description: "Short landing recovery motion after jump",
    iconPath: "side",
    isTransitionOnly: true
  },
  {
    id: "toeLoop",
    name: "Loop Jump",
    category: "Jump",
    requiredTime: 1.5,
    difficulty: "Medium",
    description: "Basic rotational jump motion",
    iconPath: "loop",
    imgPath: "img/loop-jump.png"
  },
  {
    id: "splitJump",
    name: "Split Jump",
    category: "Jump",
    requiredTime: 2,
    difficulty: "High",
    description: "Jump with one's legs wide open back and forth in the air",
    iconPath: "split",
    imgPath: "img/split-jump.png"
  },
  {
    id: "uprightSpin",
    name: "Upright Spin",
    category: "Spin",
    requiredTime: 3,
    difficulty: "Medium",
    description: "Spin that rotates quickly while standing",
    iconPath: "upright",
    imgPath: "img/upright-spin.png"
  },
  {
    id: "sitSpin",
    name: "Sit Spin",
    category: "Spin",
    requiredTime: 5,
    difficulty: "High",
    description: "Spin that rotates while sitting in a low position",
    iconPath: "sit",
    imgPath: "img/sit-spin.png"
  },
  {
    id: "spiral",
    name: "Spiral",
    category: "Step / Spiral",
    requiredTime: 5,
    difficulty: "Medium",
    description: "Movement in which one leg is held high back and slides.",
    iconPath: "spiral",
    imgPath: "img/spiral.png"
  }
];

// 기본 전환 동작 시간
export const TRANSITION_TIME = 3;

// id를 기준으로 action 정보를 찾음
export function getActionById(id) {
  return ACTIONS.find(action => action.id === id);
}

// 점프 계열 동작인지 판별
function isJumpAction(actionId) {
  return actionId === "toeLoop" || actionId === "splitJump";
}

// 이전 동작에 따라 사용할 transition action을 결정
function getTransitionActionId(prevActionId) {
  if (isJumpAction(prevActionId)) {
    return "landingStep";
  }

  return "sideStep";
}

// 이전 동작에 따른 transition 시간 계산
function getTransitionTime(prevActionId) {
  const transitionAction = getActionById(getTransitionActionId(prevActionId));

  if (transitionAction) {
    return transitionAction.requiredTime;
  }

  return TRANSITION_TIME;
}

// sequence 전체 재생 시간 계산
export function getTotalTime(sequence) {
  if (sequence.length === 0) return 0;

  let total = 0;

  for (let i = 0; i < sequence.length; i++) {
    const action = getActionById(sequence[i].actionId);
    total += action ? action.requiredTime : 0;

    // 마지막 동작이 아니라면 동작 사이의 transition 시간도 추가
    if (i < sequence.length - 1) {
      total += getTransitionTime(sequence[i].actionId);
    }
  }

  // 소수점 오차를 줄이기 위해 소수점 한 자리 기준으로 반올림
  return Math.round(total * 10) / 10;
}

/**
 * 현재 시간 기준으로 sequence에서 몇 번째 동작을 수행 중인지 반환
 * transition 구간일 때는 이전 action의 index를 반환한다.
 */
export function getCurrentActionIndex(sequence, currentTime) {
  if (sequence.length === 0) return -1;

  let elapsed = 0;

  for (let i = 0; i < sequence.length; i++) {
    const action = getActionById(sequence[i].actionId);
    if (!action) continue;

    // 현재 시간이 action 자체의 재생 구간 안에 있는지 확인
    if (currentTime >= elapsed && currentTime < elapsed + action.requiredTime) {
      return i;
    }

    elapsed += action.requiredTime;

    // 현재 시간이 action 이후 transition 구간 안에 있는지 확인
    if (i < sequence.length - 1) {
      const transitionTime = getTransitionTime(sequence[i].actionId);

      if (currentTime >= elapsed && currentTime < elapsed + transitionTime) {
        return i;
      }

      elapsed += transitionTime;
    }
  }

  return sequence.length - 1;
}

/**
 * 현재 시간에 실제로 재생해야 할 action 정보를 반환
 * 일반 action인지 transition action인지도 함께 구분한다.
 */
export function getPlaybackInfo(sequence, currentTime) {
  if (sequence.length === 0) {
    return { action: null, isTransition: false, localTime: 0 };
  }

  let elapsed = 0;

  for (let i = 0; i < sequence.length; i++) {
    const action = getActionById(sequence[i].actionId);
    if (!action) continue;

    // 실제 action 재생 구간
    if (currentTime >= elapsed && currentTime < elapsed + action.requiredTime) {
      return {
        action,
        isTransition: false,
        localTime: currentTime - elapsed,
        index: i
      };
    }

    elapsed += action.requiredTime;

    // action과 다음 action 사이의 transition 재생 구간
    if (i < sequence.length - 1) {
      const transitionActionId = getTransitionActionId(sequence[i].actionId);
      const transitionAction = getActionById(transitionActionId);
      const transitionTime = getTransitionTime(sequence[i].actionId);

      if (currentTime >= elapsed && currentTime < elapsed + transitionTime) {
        return {
          action: transitionAction,
          isTransition: true,
          localTime: currentTime - elapsed,
          index: i
        };
      }

      elapsed += transitionTime;
    }
  }

  // 예외 상황에서는 마지막 action을 반환
  const lastAction = getActionById(sequence[sequence.length - 1].actionId);

  return {
    action: lastAction,
    isTransition: false,
    localTime: lastAction ? lastAction.requiredTime : 0,
    index: sequence.length - 1
  };
}