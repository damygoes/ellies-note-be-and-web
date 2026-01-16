export function addLocalDays(dateKey: string, deltaDays: number) {
  const d = new Date(dateKey + "T00:00:00.000Z"); // treat as day key only
  d.setUTCDate(d.getUTCDate() + deltaDays);
  return d.toISOString().slice(0, 10);
}
