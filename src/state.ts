import { getHeight } from "./heights.js";
import { clamp } from "./math.js";
import { getScrollY } from "./scroll.js";
import type {
  NormalizedOptions,
  ScrollHeadChanged,
  ScrollHeadDirection,
  ScrollHeadEdge,
  ScrollHeadSize,
  ScrollHeadState,
  ScrollHeadVisibility
} from "./types.js";

export interface ScrollMemory {
  hideDistance: number;
  revealDistance: number;
}

export function createScrollMemory(): ScrollMemory {
  return {
    hideDistance: 0,
    revealDistance: 0
  };
}

export function getInitialState(config: NormalizedOptions): ScrollHeadState {
  const y = Math.max(0, getScrollY(config.root));
  const size = getSize(y, config, "full");
  const edge: ScrollHeadEdge = y <= config.topThreshold ? "top" : "away";
  return {
    visibility: "visible",
    size,
    edge: config.behaviors.has("elevate") ? edge : "top",
    direction: "idle",
    y,
    progress: getProgress(y, config.progressRange),
    height: getHeight(size, config.heights)
  };
}

export function computeNextState(
  config: NormalizedOptions,
  currentState: ScrollHeadState,
  lastY: number,
  memory: ScrollMemory
): ScrollHeadState {
  const y = Math.max(0, getScrollY(config.root));
  const delta = y - lastY;
  const direction = getDirection(delta, currentState.direction);
  const edge: ScrollHeadEdge = y <= config.topThreshold ? "top" : "away";
  const size = getSize(y, config, currentState.size);
  const progress = getProgress(y, config.progressRange);
  let visibility: ScrollHeadVisibility = currentState.visibility;

  if (edge === "top") {
    visibility = "visible";
    memory.hideDistance = 0;
    memory.revealDistance = 0;
  } else if (config.behaviors.has("hide")) {
    if (delta > 0 && y > config.hideAfter) {
      memory.hideDistance += delta;
      memory.revealDistance = 0;
      if (memory.hideDistance >= config.hideDistance) {
        visibility = "hidden";
      }
    } else if (delta < 0) {
      memory.revealDistance += Math.abs(delta);
      memory.hideDistance = 0;
      if (memory.revealDistance >= config.revealDistance) {
        visibility = "visible";
      }
    }
  } else {
    visibility = "visible";
  }

  return {
    visibility,
    size,
    edge: config.behaviors.has("elevate") ? edge : "top",
    direction,
    y,
    progress,
    height: getHeight(size, config.heights)
  };
}

export function getChanged(a: ScrollHeadState, b: ScrollHeadState): ScrollHeadChanged {
  return {
    visibility: a.visibility !== b.visibility,
    size: a.size !== b.size,
    edge: a.edge !== b.edge,
    direction: a.direction !== b.direction,
    y: a.y !== b.y,
    progress: a.progress !== b.progress,
    height: a.height !== b.height
  };
}

export function hasChanged(changed: ScrollHeadChanged): boolean {
  return Object.values(changed).some(Boolean);
}

function getSize(
  y: number,
  config: NormalizedOptions,
  currentSize: ScrollHeadSize
): ScrollHeadSize {
  if (!config.behaviors.has("compact")) return "full";
  if (currentSize === "compact") {
    return y <= config.restoreCompactAt ? "full" : "compact";
  }
  return y > config.compactAt ? "compact" : "full";
}

function getDirection(delta: number, fallback: ScrollHeadDirection): ScrollHeadDirection {
  if (Math.abs(delta) < 1) return fallback === "idle" ? "idle" : fallback;
  return delta > 0 ? "down" : "up";
}

function getProgress(y: number, range: [number, number]): number {
  const [start, end] = range;
  if (end === start) return y >= end ? 1 : 0;
  return clamp((y - start) / (end - start), 0, 1);
}
