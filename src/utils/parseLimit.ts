export function parseLimit(url: URL) {
  const raw = url.searchParams.get("limit");
  const n = raw ? Number(raw) : 10;
  if (!Number.isFinite(n)) return 10;
  return Math.min(50, Math.max(1, Math.trunc(n)));
}
