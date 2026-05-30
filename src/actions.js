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

export const TRANSITION_TIME = 3; // default transition time for Side Step

export function getActionById(id) {
  return ACTIONS.find(action => action.id === id);
}

function isJumpAction(actionId) {
  return actionId === "toeLoop" || actionId === "splitJump";
}

function getTransitionActionId(prevActionId) {
  if (isJumpAction(prevActionId)) {
    return "landingStep";
  }

  return "sideStep";
}

function getTransitionTime(prevActionId) {
  const transitionAction = getActionById(getTransitionActionId(prevActionId));

  if (transitionAction) {
    return transitionAction.requiredTime;
  }

  return TRANSITION_TIME;
}

export function getTotalTime(sequence) {
  if (sequence.length === 0) return 0;

  let total = 0;

  for (let i = 0; i < sequence.length; i++) {
    const action = getActionById(sequence[i].actionId);
    total += action ? action.requiredTime : 0;

    // Add transition time between actions
    if (i < sequence.length - 1) {
      total += getTransitionTime(sequence[i].actionId);
    }
  }

  return Math.round(total * 10) / 10;
}

/**
 * Returns the index in the sequence or information about being in a transition
 */
export function getCurrentActionIndex(sequence, currentTime) {
  if (sequence.length === 0) return -1;

  let elapsed = 0;

  for (let i = 0; i < sequence.length; i++) {
    const action = getActionById(sequence[i].actionId);
    if (!action) continue;

    // Check if we are in the action period
    if (currentTime >= elapsed && currentTime < elapsed + action.requiredTime) {
      return i;
    }

    elapsed += action.requiredTime;

    // Check if we are in the transition period
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
 * Helper to determine if the current time is within a transition period
 */
export function getPlaybackInfo(sequence, currentTime) {
  if (sequence.length === 0) {
    return { action: null, isTransition: false, localTime: 0 };
  }

  let elapsed = 0;

  for (let i = 0; i < sequence.length; i++) {
    const action = getActionById(sequence[i].actionId);
    if (!action) continue;

    // Action period
    if (currentTime >= elapsed && currentTime < elapsed + action.requiredTime) {
      return {
        action,
        isTransition: false,
        localTime: currentTime - elapsed,
        index: i
      };
    }

    elapsed += action.requiredTime;

    // Transition period
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

  // Fallback to last action
  const lastAction = getActionById(sequence[sequence.length - 1].actionId);

  return {
    action: lastAction,
    isTransition: false,
    localTime: lastAction ? lastAction.requiredTime : 0,
    index: sequence.length - 1
  };
}