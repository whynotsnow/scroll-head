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
   * Scroll position where full height changes to compact height.
   */
  compactAt?: number;
  /**
   * Scroll position where hide-on-scroll-down can begin.
   *
   * false disables automatic hiding while keeping compact/elevate behavior.
   */
  hideAfter?: number | false;
  /**
   * Scroll position where compact height returns to full height.
   */
  restoreCompactAt?: number;
  /**
   * Downward distance required before hiding.
   */
  hideDistance?: number;
  /**
   * Upward distance required before revealing.
   */
  revealDistance?: number;
  /**
   * @deprecated Use compactAt.
   */
  threshold?: number;
  /**
   * @deprecated Use hideAfter.
   */
  hideThreshold?: number;
  /**
   * @deprecated Use restoreCompactAt.
   */
  compactReleaseThreshold?: number;
  /**
   * Position treated as the page top. Useful when the page has a tiny offset.
   */
  topThreshold?: number;
  /**
   * @deprecated Use hideDistance.
   */
  hideDelta?: number;
  /**
   * @deprecated Use revealDistance.
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

export interface NormalizedOptions {
  behaviors: Set<ScrollHeadBehavior>;
  compactAt: number;
  hideAfter: number;
  restoreCompactAt: number;
  topThreshold: number;
  hideDistance: number;
  revealDistance: number;
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
