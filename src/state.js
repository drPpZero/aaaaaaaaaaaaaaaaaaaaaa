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

  // 최대 개수에 도달하면 더 이상 추가하지 않음
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

export function insertActionAt(actionId, index) {
  if (!actionId) return;

  const safeIndex = Math.max(0, Math.min(index, state.sequence.length));

  state.sequence.splice(safeIndex, 0, {
    instanceId: makeInstanceId(),
    actionId,
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
  state.errorMessage = "";
  notify();
}

export function tryEnterPlayMode() {
  // sequence가 비어 있을 때만 play 진입을 막음
  if (state.sequence.length === 0) {
    state.errorMessage = "There isn't any action. Please append one action.";
    notify();
    return false;
  }

  // sequence가 20개여도 정상적으로 재생 가능
  state.mode = "play";
  state.isPlaying = true;
  state.currentTime = 0;
  state.currentActionIndex = 0;
  state.errorMessage = "";

  notify();
  return true;
}

export function enterEditMode() {
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
  state.currentTime = 0;
  state.currentActionIndex = getCurrentActionIndex(state.sequence, 0);
  state.isPlaying = true;
  notify();
}

export function setCurrentTime(seconds, silent = false) {
  const totalTime = getTotalTime(state.sequence);

  state.currentTime = clamp(Number(seconds) || 0, 0, totalTime);
  state.currentActionIndex = getCurrentActionIndex(state.sequence, state.currentTime);

  // 재생 시간이 전체 시간을 넘으면 자동 정지
  if (totalTime > 0 && state.currentTime >= totalTime) {
    state.currentTime = totalTime;
    state.isPlaying = false;
    notify();
  } else {
    if (!silent) notify();
  }
}

export function advancePlayback(deltaSeconds) {
  // edit 모드에서는 선택한 동작을 preview 화면에서 계속 재생
  if (state.mode === "edit" && state.selectedActionId) {
    state.previewTime += deltaSeconds;
    return;
  }

  // play 모드가 아니거나 일시정지 상태면 시간 진행하지 않음
  if (state.mode !== "play" || !state.isPlaying) return;

  setCurrentTime(state.currentTime + deltaSeconds, true);
}

function makeInstanceId() {
  if (globalThis.crypto?.randomUUID) {
    return globalThis.crypto.randomUUID();
  }

  return `seq-${Date.now()}-${Math.random().toString(16).slice(2)}`;
}

function clamp(value, min, max) {
  return Math.max(min, Math.min(value, max));
}