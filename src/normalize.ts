import { DEFAULT_BEHAVIORS, DEFAULT_CLASSES, DEFAULT_HEIGHTS, DEFAULT_OPTIONS } from "./defaults.js";
import { getHeightDelta } from "./heights.js";
import { normalizeDistance, normalizeHideAfter, normalizeProgressRange } from "./math.js";
import type { NormalizedOptions, ScrollHeadClasses, ScrollHeadOptions } from "./types.js";

export function normalizeOptions(options: ScrollHeadOptions): NormalizedOptions {
  const root = options.root ?? window;
  const heights = {
    full: options.heights?.full ?? DEFAULT_HEIGHTS.full,
    compact: options.heights?.compact ?? DEFAULT_HEIGHTS.compact
  };
  const heightDelta = getHeightDelta(heights);
  const topThreshold = normalizeDistance(options.topThreshold, DEFAULT_OPTIONS.topThreshold);
  const compactAt = normalizeDistance(
    options.compactAt ?? options.threshold,
    DEFAULT_OPTIONS.compactAt
  );
  const hideAfter = normalizeHideAfter(options.hideAfter ?? options.hideThreshold, compactAt);
  const restoreCompactAt = normalizeDistance(
    options.restoreCompactAt ?? options.compactReleaseThreshold,
    Math.max(topThreshold, compactAt - heightDelta - 8)
  );

  return {
    behaviors: new Set(options.behaviors ?? DEFAULT_BEHAVIORS),
    compactAt,
    hideAfter,
    restoreCompactAt: Math.min(restoreCompactAt, compactAt),
    topThreshold,
    hideDistance: normalizeDistance(
      options.hideDistance ?? options.hideDelta,
      DEFAULT_OPTIONS.hideDistance
    ),
    revealDistance: normalizeDistance(
      options.revealDistance ?? options.revealDelta,
      DEFAULT_OPTIONS.revealDistance
    ),
    progressRange: normalizeProgressRange(options.progressRange, [0, compactAt]),
    heights,
    root,
    attributePrefix: options.attributePrefix ?? DEFAULT_OPTIONS.attributePrefix,
    cssVarPrefix: options.cssVarPrefix ?? DEFAULT_OPTIONS.cssVarPrefix,
    attributes: options.attributes ?? true,
    cssVars: options.cssVars ?? true,
    classes: normalizeClasses(options.classes),
    disabled: options.disabled ?? false,
    onChange: options.onChange
  };
}

function normalizeClasses(
  classes: ScrollHeadOptions["classes"]
): Required<ScrollHeadClasses> | null {
  if (!classes) return null;
  if (classes === true) return DEFAULT_CLASSES;
  return {
    ...DEFAULT_CLASSES,
    ...classes
  };
}
