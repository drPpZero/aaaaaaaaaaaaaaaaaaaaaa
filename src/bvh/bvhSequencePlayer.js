import { getActionById, getTotalTime, getCurrentActionIndex } from "../actions.js";
import { loadBVH } from "./bvhLoader.js";

export class BVHSequencePlayer {
  constructor(model = null) {
    this.model = model;
    this.sequence = [];
    this.timeline = [];
    this.motions = new Map();
    this.currentTime = 0;
  }

  async setSequence(sequence) {
    this.sequence = sequence;
    this.timeline = buildTimeline(sequence);

    const actionIds = [...new Set(sequence.map((item) => item.actionId))];

    await Promise.all(
      actionIds.map(async (actionId) => {
        const action = getActionById(actionId);
        if (!action?.bvhPath) return;

        try {
          const motion = await loadBVH(action.bvhPath);
          this.motions.set(actionId, motion);
        } catch (error) {
          console.warn(error.message);
        }
      })
    );
  }

  setTime(globalTime) {
    const totalTime = getTotalTime(this.sequence);
    this.currentTime = Math.max(0, Math.min(globalTime, totalTime));

    const activeIndex = getCurrentActionIndex(this.sequence, this.currentTime);
    const segment = this.timeline[activeIndex];

    if (!segment) {
      return { activeIndex: -1, localTime: 0, pose: null };
    }

    const localTime = this.currentTime - segment.startTime;
    const motion = this.motions.get(segment.actionId);
    const pose = motion ? sampleMotion(motion, localTime, segment.duration) : null;

    if (pose && this.model?.applyPose) {
      this.model.applyPose(pose);
    }

    return { activeIndex, localTime, pose, segment };
  }

  reset() {
    return this.setTime(0);
  }
}

export function buildTimeline(sequence) {
  let cursor = 0;

  return sequence.map((item, index) => {
    const action = getActionById(item.actionId);
    const duration = action ? action.requiredTime : 0;

    const segment = {
      index,
      instanceId: item.instanceId,
      actionId: item.actionId,
      startTime: cursor,
      endTime: cursor + duration,
      duration,
    };

    cursor += duration;
    return segment;
  });
}

function sampleMotion(motion, localTime, requiredDuration) {
  if (!motion.frames.length) return null;

  const ratio = requiredDuration > 0 ? localTime / requiredDuration : 0;
  const sourceTime = ratio * motion.duration;
  const frameIndex = Math.max(
    0,
    Math.min(motion.frames.length - 1, Math.floor(sourceTime / motion.frameTime))
  );

  return {
    joints: motion.joints,
    frame: motion.frames[frameIndex],
    frameIndex,
    sourceTime,
  };
}
