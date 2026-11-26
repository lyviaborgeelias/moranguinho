// The server is authoritative for rewards; local snapshots and drafts support offline review.
const prefix = () =>
  `moranguinho-progress-v2:${localStorage.getItem("tutti-frutti-guest-id") || "local"}:`;
export function readLocal(key, fallback = null) {
  try {
    return JSON.parse(localStorage.getItem(prefix() + key)) ?? fallback;
  } catch {
    return fallback;
  }
}
export function writeLocal(key, value) {
  try {
    localStorage.setItem(prefix() + key, JSON.stringify(value));
  } catch {
    /* The adventure remains playable when browser storage is unavailable. */
  }
}
export function clearLocalJourney() {
  try {
    Object.keys(localStorage)
      .filter((key) => key.startsWith(prefix()))
      .forEach((key) => localStorage.removeItem(key));
  } catch {
    /* Storage unavailable. */
  }
}
export function orderedClues(activities, order) {
  const collected = activities.filter((item) => item.status === "completed");
  const ids = [...new Set([...order, ...collected.map((item) => item.id)])];
  return ids.map((id) => collected.find((item) => item.id === id)).filter(Boolean);
}
export function reorder(items, sourceId, targetId) {
  const next = [...items];
  const from = next.indexOf(sourceId),
    to = next.indexOf(targetId);
  if (from < 0 || to < 0 || from === to) return next;
  next.splice(to, 0, next.splice(from, 1)[0]);
  return next;
}
