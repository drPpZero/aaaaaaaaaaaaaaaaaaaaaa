import { getCurrentActionIndex, getTotalTime } from "./actions.js";

const subscribers = new Set();

export const state = {
  mode: "edit",
  selectedActionId: null,
  sequence: [],
  isPlaying: false,
  currentTime: 0,
  previewTime: 0,
  currentActionIndex: -1,
  errorMessage: "",
  maxSequenceLength: 20,
};

export function subscribe(callback) {
  subscribers.add(callback);
  return () => subscribers.delete(callback);
}

export function notify() {
  subscribers.forEach((callback) => callback(state));
}

export function selectAction(actionId) {
  state.selectedActionId = actionId;
  state.previewTime = 0;
  state.errorMessage = "";
  notify();
}

export function appendSelectedAction() {
  if (!state.selectedActionId) return;

  if (state.sequence.length >= state.maxSequenceLength) {
    state.errorMessage = "You can append up to 20 actions.";
    notify();
    return;
  }

  state.sequence.push({
    instanceId: makeInstanceId(),
    actionId: state.selectedActionId,
  });

  state.errorMessage = "";
  notify();
}

export function deleteSequenceItem(instanceId) {
  state.sequence = state.sequence.filter((item) => item.instanceId !== instanceId);

  const totalTime = getTotalTime(state.sequence);
  if (state.currentTime > totalTime) {
    state.currentTime = totalTime;
  }

  state.currentActionIndex = getCurrentActionIndex(state.sequence, state.currentTime);
  notify();
}

export function tryEnterPlayMode() {
  if (state.sequence.length === 0) {
    state.errorMessage = "There isn't any action. Please append one of action";
    notify();
    return false;
  }

  state.mode = "play";
  state.isPlaying = true;
  state.currentTime = 0;
  state.currentActionIndex = 0;
  state.errorMessage = "";
  notify();
  return true;
}

export function enterEditMode() {
  // Sequence is preserved. This works even while the model is playing.
  state.mode = "edit";
  state.isPlaying = false;
  state.currentTime = 0;
  state.currentActionIndex = getCurrentActionIndex(state.sequence, 0);
  state.errorMessage = "";
  notify();
}

export function togglePlayPause() {
  state.isPlaying = !state.isPlaying;
  notify();
}

export function resetPlayback() {
  // Reset works even while the model is playing.
  state.currentTime = 0;
  state.currentActionIndex = getCurrentActionIndex(state.sequence, 0);
  state.isPlaying = true;
  notify();
}

export function setCurrentTime(seconds, silent = false) {
  const totalTime = getTotalTime(state.sequence);

  state.currentTime = clamp(Number(seconds) || 0, 0, totalTime);
  state.currentActionIndex = getCurrentActionIndex(state.sequence, state.currentTime);

if (totalTime > 0 && state.currentTime >= totalTime) {
    state.currentTime = totalTime;
    state.isPlaying = false;
    notify();
  } else {
    if (!silent) notify();
  }
}

export function advancePlayback(deltaSeconds) {
  if (state.mode === "edit" && state.selectedActionId) {
    state.previewTime += deltaSeconds;
    return;
  }
  
  if (state.mode !== "play" || !state.isPlaying) return;
  setCurrentTime(state.currentTime + deltaSeconds, true);
}

function makeInstanceId() {
  if (globalThis.crypto?.randomUUID) return globalThis.crypto.randomUUID();
  return `seq-${Date.now()}-${Math.random().toString(16).slice(2)}`;
}

function clamp(value, min, max) {
  return Math.max(min, Math.min(value, max));
}
