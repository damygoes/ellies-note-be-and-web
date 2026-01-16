/**
 * tzOffsetMinutes = new Date().getTimezoneOffset() from the client
 * (Berlin winter: -60, UTC: 0)
 *
 * use for grouping, caching, map keys, IDs
 */
export function getLocalTodayDateKey(now: Date, tzOffsetMinutes: number) {
  const localMs = now.getTime() - tzOffsetMinutes * 60_000;
  const d = new Date(localMs);
  d.setHours(0, 0, 0, 0);
  // YYYY-MM-DD in "local frame"
  return d.toISOString().slice(0, 10);
}
