export function isoDayKey(date: Date) {
  // YYYY-MM-DD (UTC)
  return date.toISOString().slice(0, 10);
}
