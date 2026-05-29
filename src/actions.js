export const ACTIONS = [
  {
    id: "sideStep",
    name: "Side Step",
    category: "Step / Spiral",
    requiredTime: 4,
    difficulty: "Low",
    description: "Basic side step motion",
    iconPath: "side"
  },
  {
    id: "toeLoop",
    name: "Loop Jump",
    category: "Jump",
    requiredTime: 1.5,
    difficulty: "Medium",
    description: "Basic rotational jump motion",
    iconPath: "loop"
  },
  {
    id: "splitJump",
    name: "Split Jump",
    category: "Jump",
    requiredTime: 2,
    difficulty: "High",
    description: "Jump with one's legs wide open back and forth in the air",
    iconPath: "split"
  },
  {
    id: "uprightSpin",
    name: "Upright Spin",
    category: "Spin",
    requiredTime: 3,
    difficulty: "Medium",
    description: "Spin that rotates quickly while standing",
    iconPath: "upright"
  },
  {
    id: "sitSpin",
    name: "Sit Spine",
    category: "Spin",
    requiredTime: 5,
    difficulty: "High",
    description: "Spin that rotates while sitting in a low position",
    iconPath: "sit"
  },
  {
    id: "spiral",
    name: "Spiral",
    category: "Step / Spiral",
    requiredTime: 5,
    difficulty: "Medium",
    description: "Movement in which one leg is held high back and slides.",
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