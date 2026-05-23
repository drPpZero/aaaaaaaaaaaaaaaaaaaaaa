export function formatTime(seconds) {
  const safeSeconds = Math.max(0, Number(seconds) || 0);
  const rounded = Math.floor(safeSeconds);
  const min = Math.floor(rounded / 60);
  const sec = rounded % 60;
  return `${String(min).padStart(2, "0")}:${String(sec).padStart(2, "0")}`;
}
