export const ACTIONS = [
  {
    id: "loop_jump",
    name: "Loop Jump",
    category: "Jump",
    requiredTime: 3,
    difficulty: "Medium",
    description: "A jump that takes off from a back outside edge and lands on the same back outside edge.",
    iconPath: "loop",
    bvhPath: "./assets/bvh/loop_jump.bvh",
  },
  {
    id: "upright_spin",
    name: "Upright Spin",
    category: "Spin",
    requiredTime: 4,
    difficulty: "Medium",
    description: "A spin performed in an upright position while rotating on one foot.",
    iconPath: "upright",
    bvhPath: "./assets/bvh/upright_spin.bvh",
  },
  {
    id: "spiral",
    name: "Spiral",
    category: "Step / Spiral",
    requiredTime: 4,
    difficulty: "Medium",
    description: "The action of lifting one leg back, tilting the upper body forward, and sliding.",
    iconPath: "spiral",
    bvhPath: "./assets/bvh/spiral.bvh",
  },
  {
    id: "split_jump",
    name: "Split Jump",
    category: "Jump",
    requiredTime: 3,
    difficulty: "Medium",
    description: "A jump where the skater extends both legs into a split-like pose in the air.",
    iconPath: "split",
    bvhPath: "./assets/bvh/split_jump.bvh",
  },
  {
    id: "sit_spin",
    name: "Sit Spin",
    category: "Spin",
    requiredTime: 4,
    difficulty: "Hard",
    description: "A spin performed in a low sitting position with one leg extended forward.",
    iconPath: "sit",
    bvhPath: "./assets/bvh/sit_spin.bvh",
  },
  {
    id: "side_step",
    name: "Side Step",
    category: "Step / Spiral",
    requiredTime: 2,
    difficulty: "Easy",
    description: "A short step sequence that moves the skater sideways across the ice.",
    iconPath: "side",
    bvhPath: "./assets/bvh/side_step.bvh",
  },
];

export function getActionById(actionId) {
  return ACTIONS.find((action) => action.id === actionId) ?? null;
}

export function getTotalTime(sequence) {
  return sequence.reduce((sum, sequenceItem) => {
    const action = getActionById(sequenceItem.actionId);
    return sum + (action ? action.requiredTime : 0);
  }, 0);
}

export function getCurrentActionIndex(sequence, currentTime) {
  if (sequence.length === 0) return -1;

  let startTime = 0;

  for (let index = 0; index < sequence.length; index += 1) {
    const action = getActionById(sequence[index].actionId);
    if (!action) continue;

    const endTime = startTime + action.requiredTime;

    if (currentTime >= startTime && currentTime < endTime) {
      return index;
    }

    startTime = endTime;
  }

  return sequence.length - 1;
}
