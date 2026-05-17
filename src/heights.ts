import type { ScrollHeadHeights, ScrollHeadSize } from "./types.js";

export function getHeight(size: ScrollHeadSize, heights: Required<ScrollHeadHeights>): string {
  return toCssLength(size === "compact" ? heights.compact : heights.full);
}

export function toCssLength(value: number | string): string {
  return typeof value === "number" ? `${value}px` : value;
}

export function getHeightDelta(heights: Required<ScrollHeadHeights>): number {
  const full = parsePixelLength(heights.full);
  const compact = parsePixelLength(heights.compact);
  if (full === null || compact === null) return 16;
  return Math.max(0, full - compact);
}

function parsePixelLength(value: number | string): number | null {
  if (typeof value === "number") return value;
  const match = value.trim().match(/^(-?\d+(?:\.\d+)?)px$/);
  return match ? Number(match[1]) : null;
}
