export function isIntegerInRange(n: unknown, min: number, max: number) {
  return Number.isInteger(n) && (n as number) >= min && (n as number) <= max;
}
