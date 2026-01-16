/**
 * tzOffsetMinutes should be JS Date.getTimezoneOffset() from the client:
 * - Berlin winter: -60
 * - UTC: 0
 *
 * use for comparisons, ranges, persistence, queries
 */
export function startOfLocalDay(now: Date, tzOffsetMinutes: number) {
  // localMs = utcMs - offsetMinutes
  const localMs = now.getTime() - tzOffsetMinutes * 60_000;
  const local = new Date(localMs);
  local.setHours(0, 0, 0, 0);

  // Convert back to UTC
  return new Date(local.getTime() + tzOffsetMinutes * 60_000);
}
