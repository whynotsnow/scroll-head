export type ScrollHeadBehavior = "hide" | "compact" | "elevate";

export type ScrollHeadDirection = "up" | "down" | "idle";

export type ScrollHeadVisibility = "visible" | "hidden";

export type ScrollHeadSize = "full" | "compact";

export type ScrollHeadEdge = "top" | "away";

export interface ScrollHeadHeights {
  full?: number | string;
  compact?: number | string;
}

export interface ScrollHeadState {
  visibility: ScrollHeadVisibility;
  size: ScrollHeadSize;
  edge: ScrollHeadEdge;
  direction: ScrollHeadDirection;
  y: number;
  progress: number;
  height: string;
}

export interface ScrollHeadChanged {
  visibility: boolean;
  size: boolean;
  edge: boolean;
  direction: boolean;
  y: boolean;
  progress: boolean;
  height: boolean;
}

export interface ScrollHeadChangeEvent {
  element: HTMLElement;
  state: ScrollHeadState;
  previousState: ScrollHeadState;
  changed: ScrollHeadChanged;
}

export interface ScrollHeadClasses {
  root?: string;
  visible?: string;
  hidden?: string;
  full?: string;
  compact?: string;
  top?: string;
  away?: string;
  directionUp?: string;
  directionDown?: string;
  directionIdle?: string;
}

export interface ScrollHeadOptions {
  /**
   * Behaviors controlled by the library. Visual transitions remain in CSS.
   *
   * hide: hide when scrolling down and reveal when scrolling up.
   * compact: switch from full to compact size after threshold.
   * elevate: expose top/away edge state for background/shadow styling.
   */
  behaviors?: ScrollHeadBehavior[];
  /**
   * Scroll position where compact/elevated states begin.
   */
  threshold?: number;
  /**
   * Position treated as the page top. Useful when the page has a tiny offset.
   */
  topThreshold?: number;
  /**
   * Downward distance required before hiding.
   */
  hideDelta?: number;
  /**
   * Upward distance required before revealing.
   */
  revealDelta?: number;
  /**
   * Range used to calculate --scroll-head-progress.
   */
  progressRange?: [start: number, end: number];
  heights?: ScrollHeadHeights;
  /**
   * Window or scrollable element. Defaults to window.
   */
  root?: Window | HTMLElement;
  /**
   * data attribute prefix. Defaults to "data-scroll-head".
   */
  attributePrefix?: string;
  /**
   * CSS variable prefix. Defaults to "--scroll-head".
   */
  cssVarPrefix?: string;
  attributes?: boolean;
  cssVars?: boolean;
  classes?: boolean | ScrollHeadClasses;
  disabled?: boolean;
  onChange?: (event: ScrollHeadChangeEvent) => void;
}

export interface ScrollHeadController {
  getState: () => ScrollHeadState;
  update: () => void;
  enable: () => void;
  disable: () => void;
  destroy: () => void;
}

interface NormalizedOptions {
  behaviors: Set<ScrollHeadBehavior>;
  threshold: number;
  topThreshold: number;
  hideDelta: number;
  revealDelta: number;
  progressRange: [number, number];
  heights: Required<ScrollHeadHeights>;
  root: Window | HTMLElement;
  attributePrefix: string;
  cssVarPrefix: string;
  attributes: boolean;
  cssVars: boolean;
  classes: Required<ScrollHeadClasses> | null;
  disabled: boolean;
  onChange?: (event: ScrollHeadChangeEvent) => void;
}

const DEFAULT_OPTIONS = {
  threshold: 80,
  topThreshold: 0,
  hideDelta: 16,
  revealDelta: 8,
  attributePrefix: "data-scroll-head",
  cssVarPrefix: "--scroll-head"
} as const;

const DEFAULT_HEIGHTS: Required<ScrollHeadHeights> = {
  full: "72px",
  compact: "56px"
};

const DEFAULT_BEHAVIORS: ScrollHeadBehavior[] = ["hide", "compact", "elevate"];

const DEFAULT_CLASSES: Required<ScrollHeadClasses> = {
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

export function createScrollHead(
  element: HTMLElement,
  options: ScrollHeadOptions = {}
): ScrollHeadController {
  if (!element) {
    throw new Error("createScrollHead requires a header element.");
  }

  const config = normalizeOptions(options);
  const attrNames = getAttributeNames(config.attributePrefix);
  const varNames = getVariableNames(config.cssVarPrefix);
  const previousAttributes = snapshotAttributes(element, Object.values(attrNames));
  const previousVariables = snapshotVariables(element, Object.values(varNames));
  const previousClasses = snapshotClasses(element, getClassNames(config.classes));

  let state = getInitialState(config);
  let enabled = !config.disabled;
  let destroyed = false;
  let frame = 0;
  let previousY = getScrollY(config.root);
  let hideDistance = 0;
  let revealDistance = 0;

  const schedule = () => {
    if (!enabled || destroyed || frame) return;
    frame = getWindow(config.root).requestAnimationFrame(runUpdate);
  };

  const runUpdate = () => {
    frame = 0;
    const nextState = computeNextState(config, state, previousY);
    const previousState = state;
    const changed = getChanged(previousState, nextState);
    previousY = nextState.y;

    if (hasChanged(changed)) {
      state = nextState;
      applyState(element, state, config, attrNames, varNames);
      config.onChange?.({
        element,
        state,
        previousState,
        changed
      });
    } else {
      state = nextState;
      applyState(element, state, config, attrNames, varNames);
    }
  };

  const computeNextState = (
    currentConfig: NormalizedOptions,
    currentState: ScrollHeadState,
    lastY: number
  ): ScrollHeadState => {
    const y = Math.max(0, getScrollY(currentConfig.root));
    const delta = y - lastY;
    const direction = getDirection(delta, currentState.direction);
    const edge: ScrollHeadEdge = y <= currentConfig.topThreshold ? "top" : "away";
    const size = getSize(y, currentConfig);
    const progress = getProgress(y, currentConfig.progressRange);
    let visibility = currentState.visibility;

    if (edge === "top") {
      visibility = "visible";
      hideDistance = 0;
      revealDistance = 0;
    } else if (currentConfig.behaviors.has("hide")) {
      if (delta > 0 && y > currentConfig.threshold) {
        hideDistance += delta;
        revealDistance = 0;
        if (hideDistance >= currentConfig.hideDelta) {
          visibility = "hidden";
        }
      } else if (delta < 0) {
        revealDistance += Math.abs(delta);
        hideDistance = 0;
        if (revealDistance >= currentConfig.revealDelta) {
          visibility = "visible";
        }
      }
    } else {
      visibility = "visible";
    }

    return {
      visibility,
      size,
      edge: currentConfig.behaviors.has("elevate") ? edge : "top",
      direction,
      y,
      progress,
      height: getHeight(size, currentConfig.heights)
    };
  };

  const scrollTarget = getScrollTarget(config.root);
  scrollTarget.addEventListener("scroll", schedule, { passive: true });
  getWindow(config.root).addEventListener("resize", schedule, { passive: true });
  applyState(element, state, config, attrNames, varNames);
  schedule();

  return {
    getState: () => state,
    update: () => runUpdate(),
    enable: () => {
      if (destroyed) return;
      enabled = true;
      schedule();
    },
    disable: () => {
      enabled = false;
      if (frame) {
        getWindow(config.root).cancelAnimationFrame(frame);
        frame = 0;
      }
    },
    destroy: () => {
      if (destroyed) return;
      destroyed = true;
      enabled = false;
      if (frame) {
        getWindow(config.root).cancelAnimationFrame(frame);
        frame = 0;
      }
      scrollTarget.removeEventListener("scroll", schedule);
      getWindow(config.root).removeEventListener("resize", schedule);
      restoreAttributes(element, previousAttributes);
      restoreVariables(element, previousVariables);
      restoreClasses(element, previousClasses);
    }
  };
}

function normalizeOptions(options: ScrollHeadOptions): NormalizedOptions {
  const threshold = options.threshold ?? DEFAULT_OPTIONS.threshold;
  const root = options.root ?? window;
  return {
    behaviors: new Set(options.behaviors ?? DEFAULT_BEHAVIORS),
    threshold,
    topThreshold: options.topThreshold ?? DEFAULT_OPTIONS.topThreshold,
    hideDelta: options.hideDelta ?? DEFAULT_OPTIONS.hideDelta,
    revealDelta: options.revealDelta ?? DEFAULT_OPTIONS.revealDelta,
    progressRange: options.progressRange ?? [0, threshold],
    heights: {
      full: options.heights?.full ?? DEFAULT_HEIGHTS.full,
      compact: options.heights?.compact ?? DEFAULT_HEIGHTS.compact
    },
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

function getInitialState(config: NormalizedOptions): ScrollHeadState {
  const y = Math.max(0, getScrollY(config.root));
  const size = getSize(y, config);
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

function getSize(y: number, config: NormalizedOptions): ScrollHeadSize {
  if (!config.behaviors.has("compact")) return "full";
  return y > config.threshold ? "compact" : "full";
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

function getHeight(size: ScrollHeadSize, heights: Required<ScrollHeadHeights>): string {
  return toCssLength(size === "compact" ? heights.compact : heights.full);
}

function toCssLength(value: number | string): string {
  return typeof value === "number" ? `${value}px` : value;
}

function applyState(
  element: HTMLElement,
  state: ScrollHeadState,
  config: NormalizedOptions,
  attrNames: ReturnType<typeof getAttributeNames>,
  varNames: ReturnType<typeof getVariableNames>
) {
  if (config.attributes) {
    element.setAttribute(attrNames.state, state.visibility);
    element.setAttribute(attrNames.size, state.size);
    element.setAttribute(attrNames.edge, state.edge);
    element.setAttribute(attrNames.direction, state.direction);
  }

  if (config.cssVars) {
    element.style.setProperty(varNames.y, `${Math.round(state.y)}px`);
    element.style.setProperty(varNames.progress, formatNumber(state.progress));
    element.style.setProperty(varNames.height, state.height);
    element.style.setProperty(varNames.visible, state.visibility === "visible" ? "1" : "0");
  }

  if (config.classes) {
    applyClasses(element, state, config.classes);
  }
}

function applyClasses(
  element: HTMLElement,
  state: ScrollHeadState,
  classes: Required<ScrollHeadClasses>
) {
  element.classList.add(classes.root);
  element.classList.toggle(classes.visible, state.visibility === "visible");
  element.classList.toggle(classes.hidden, state.visibility === "hidden");
  element.classList.toggle(classes.full, state.size === "full");
  element.classList.toggle(classes.compact, state.size === "compact");
  element.classList.toggle(classes.top, state.edge === "top");
  element.classList.toggle(classes.away, state.edge === "away");
  element.classList.toggle(classes.directionUp, state.direction === "up");
  element.classList.toggle(classes.directionDown, state.direction === "down");
  element.classList.toggle(classes.directionIdle, state.direction === "idle");
}

function getAttributeNames(prefix: string) {
  return {
    state: `${prefix}-state`,
    size: `${prefix}-size`,
    edge: `${prefix}-edge`,
    direction: "data-scroll-direction"
  };
}

function getVariableNames(prefix: string) {
  return {
    y: `${prefix}-y`,
    progress: `${prefix}-progress`,
    height: `${prefix}-height`,
    visible: `${prefix}-visible`
  };
}

function getScrollY(root: Window | HTMLElement): number {
  return isWindow(root) ? root.scrollY || root.document.documentElement.scrollTop : root.scrollTop;
}

function getScrollTarget(root: Window | HTMLElement): Window | HTMLElement {
  return root;
}

function getWindow(root: Window | HTMLElement): Window {
  return isWindow(root) ? root : root.ownerDocument.defaultView ?? window;
}

function isWindow(value: Window | HTMLElement): value is Window {
  return "window" in value && value.window === value;
}

function snapshotAttributes(element: HTMLElement, names: string[]) {
  return new Map(names.map((name) => [name, element.getAttribute(name)]));
}

function restoreAttributes(element: HTMLElement, snapshot: Map<string, string | null>) {
  snapshot.forEach((value, name) => {
    if (value === null) {
      element.removeAttribute(name);
    } else {
      element.setAttribute(name, value);
    }
  });
}

function snapshotVariables(element: HTMLElement, names: string[]) {
  return new Map(names.map((name) => [name, element.style.getPropertyValue(name)]));
}

function restoreVariables(element: HTMLElement, snapshot: Map<string, string>) {
  snapshot.forEach((value, name) => {
    if (value) {
      element.style.setProperty(name, value);
    } else {
      element.style.removeProperty(name);
    }
  });
}

function getClassNames(classes: Required<ScrollHeadClasses> | null): string[] {
  return classes ? Array.from(new Set(Object.values(classes).filter(Boolean))) : [];
}

function snapshotClasses(element: HTMLElement, names: string[]) {
  return new Map(names.map((name) => [name, element.classList.contains(name)]));
}

function restoreClasses(element: HTMLElement, snapshot: Map<string, boolean>) {
  snapshot.forEach((wasPresent, name) => {
    element.classList.toggle(name, wasPresent);
  });
}

function getChanged(a: ScrollHeadState, b: ScrollHeadState): ScrollHeadChanged {
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

function hasChanged(changed: ScrollHeadChanged): boolean {
  return Object.values(changed).some(Boolean);
}

function clamp(value: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, value));
}

function formatNumber(value: number): string {
  return Number(value.toFixed(4)).toString();
}
