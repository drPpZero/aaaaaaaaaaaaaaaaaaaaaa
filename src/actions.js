export const ACTIONS = [
  {
    id: "sideStep",
    name: "사이드 스텝",
    category: "Step / Spiral",
    requiredTime: 4,
    difficulty: "Low",
    description: "기본적인 사이드 스텝 동작입니다.",
    iconPath: "side"
  },
  {
    id: "toeLoop",
    name: "룹 점프",
    category: "Jump",
    requiredTime: 1.5,
    difficulty: "Medium",
    description: "기본적인 회전 점프 동작입니다.",
    iconPath: "loop"
  },
  {
    id: "splitJump",
    name: "스플릿 점프",
    category: "Jump",
    requiredTime: 2,
    difficulty: "High",
    description: "공중에서 다리를 앞뒤로 크게 벌리는 점프입니다.",
    iconPath: "split"
  },
  {
    id: "uprightSpin",
    name: "업라이트 스핀",
    category: "Spin",
    requiredTime: 3,
    difficulty: "Medium",
    description: "서서 빠르게 회전하는 동작입니다.",
    iconPath: "upright"
  },
  {
    id: "sitSpin",
    name: "싯 스핀",
    category: "Spin",
    requiredTime: 5,
    difficulty: "High",
    description: "낮은 자세로 앉아서 회전하는 동작입니다.",
    iconPath: "sit"
  },
  {
    id: "spiral",
    name: "스파이럴",
    category: "Step / Spiral",
    requiredTime: 5,
    difficulty: "Medium",
    description: "한쪽 다리를 뒤로 높게 들고 활주하는 동작입니다.",
    iconPath: "spiral"
  }
];

export const TRANSITION_TIME = 3; // 3 seconds transition

export function getActionById(id) {
  return ACTIONS.find(action => action.id === id);
}

export function getTotalTime(sequence) {
  if (sequence.length === 0) return 0;
  
  let total = 0;
  for (let i = 0; i < sequence.length; i++) {
    const action = getActionById(sequence[i].actionId);
    total += (action ? action.requiredTime : 0);
    
    // Add transition time between actions
    if (i < sequence.length - 1) {
      total += TRANSITION_TIME;
    }
  }
  return total;
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
      if (currentTime >= elapsed && currentTime < elapsed + TRANSITION_TIME) {
        return i; 
      }
      elapsed += TRANSITION_TIME;
    }
  }
  return sequence.length - 1;
}

/**
 * Helper to determine if the current time is within a transition period
 */
export function getPlaybackInfo(sequence, currentTime) {
  if (sequence.length === 0) return { action: null, isTransition: false, localTime: 0 };
  
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
      if (currentTime >= elapsed && currentTime < elapsed + TRANSITION_TIME) {
        return { 
          action: getActionById("sideStep"), 
          isTransition: true, 
          localTime: currentTime - elapsed,
          index: i
        };
      }
      elapsed += TRANSITION_TIME;
    }
  }
  
  // Fallback to last action
  const lastAction = getActionById(sequence[sequence.length - 1].actionId);
  return { action: lastAction, isTransition: false, localTime: lastAction.requiredTime, index: sequence.length - 1 };
}