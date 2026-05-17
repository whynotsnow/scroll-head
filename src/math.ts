export function clamp(value: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, value));
}

export function formatNumber(value: number): string {
  return Number(value.toFixed(4)).toString();
}

export function normalizeDistance(value: number | undefined, fallback: number): number {
  if (value === undefined) return fallback;
  if (!Number.isFinite(value)) return fallback;
  return Math.max(0, value);
}

export function normalizeHideAfter(value: number | false | undefined, fallback: number): number {
  if (value === false) return Number.POSITIVE_INFINITY;
  return normalizeDistance(value, fallback);
}

export function normalizeProgressRange(
  value: [number, number] | undefined,
  fallback: [number, number]
): [number, number] {
  if (!value) return fallback;
  const start = normalizeDistance(value[0], fallback[0]);
  const end = normalizeDistance(value[1], fallback[1]);
  return [start, end];
}
