import {
  DEFAULT_CLASSES,
  DEFAULT_HEIGHTS,
  DEFAULT_OPTIONS,
  MODE_BEHAVIORS
} from "./defaults.js";
import { getHeightDelta } from "./heights.js";
import { normalizeDistance, normalizeHideAfter } from "./math.js";
import type {
  NormalizedOptions,
  ScrollHeadClasses,
  ScrollHeadOptions,
  ScrollHeadOutput
} from "./types.js";

export function normalizeOptions(options: ScrollHeadOptions): NormalizedOptions {
  const root = options.root ?? window;
  const heights = {
    full: options.heights?.full ?? DEFAULT_HEIGHTS.full,
    compact: options.heights?.compact ?? DEFAULT_HEIGHTS.compact
  };
  const heightDelta = getHeightDelta(heights);
  const topThreshold = normalizeDistance(options.top, DEFAULT_OPTIONS.topThreshold);
  const at = normalizeDistance(options.at, DEFAULT_OPTIONS.compactAt);
  const compactAt = normalizeDistance(options.on?.pass?.y, at);
  const hysteresis = normalizeDistance(options.hysteresis, heightDelta + 8);
  const restoreCompactAt = normalizeDistance(
    options.on?.returnBefore?.y,
    Math.max(topThreshold, compactAt - hysteresis)
  );

  return {
    behaviors: new Set(MODE_BEHAVIORS[options.mode ?? "auto"]),
    compactAt,
    hideAfter: normalizeHideAfter(options.on?.scrollDown?.after, compactAt),
    restoreCompactAt: Math.min(restoreCompactAt, compactAt),
    topThreshold,
    hideDistance: normalizeDistance(
      options.on?.scrollDown?.distance,
      DEFAULT_OPTIONS.hideDistance
    ),
    revealDistance: normalizeDistance(
      options.on?.scrollUp?.distance,
      DEFAULT_OPTIONS.revealDistance
    ),
    progressRange: [
      normalizeDistance(options.on?.progress?.from, 0),
      normalizeDistance(options.on?.progress?.to, compactAt)
    ],
    heights,
    root,
    attributePrefix: options.output?.attributePrefix ?? DEFAULT_OPTIONS.attributePrefix,
    cssVarPrefix: options.output?.cssVarPrefix ?? DEFAULT_OPTIONS.cssVarPrefix,
    attributes: options.output?.attributes ?? true,
    cssVars: options.output?.cssVars ?? true,
    classes: normalizeClasses(options.output?.classes),
    disabled: options.disabled ?? false,
    onChange: options.onChange
  };
}

function normalizeClasses(
  classes: ScrollHeadOutput["classes"]
): Required<ScrollHeadClasses> | null {
  if (!classes) return null;
  if (classes === true) return DEFAULT_CLASSES;
  return {
    ...DEFAULT_CLASSES,
    ...classes
  };
}
