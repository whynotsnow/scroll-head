import type {
  ScrollHeadBehavior,
  ScrollHeadClasses,
  ScrollHeadHeights,
  ScrollHeadMode
} from "./types.js";

export const DEFAULT_OPTIONS = {
  compactAt: 80,
  topThreshold: 0,
  hideDistance: 16,
  revealDistance: 8,
  attributePrefix: "data-scroll-head",
  cssVarPrefix: "--scroll-head"
} as const;

export const DEFAULT_HEIGHTS: Required<ScrollHeadHeights> = {
  full: "72px",
  compact: "56px"
};

export const DEFAULT_BEHAVIORS: ScrollHeadBehavior[] = ["hide", "compact", "elevate"];

export const MODE_BEHAVIORS: Record<ScrollHeadMode, ScrollHeadBehavior[]> = {
  auto: DEFAULT_BEHAVIORS,
  hide: ["hide", "elevate"],
  compact: ["compact", "elevate"],
  elevate: ["elevate"],
  "hide-compact": DEFAULT_BEHAVIORS,
  none: []
};

export const DEFAULT_CLASSES: Required<ScrollHeadClasses> = {
  root: "scroll-head",
  visible: "scroll-head--visible",
  hidden: "scroll-head--hidden",
  full: "scroll-head--full",
  compact: "scroll-head--compact",
  top: "scroll-head--top",
  away: "scroll-head--away",
  directionUp: "scroll-head--direction-up",
  directionDown: "scroll-head--direction-down",
  directionIdle: "scroll-head--direction-idle"
};
