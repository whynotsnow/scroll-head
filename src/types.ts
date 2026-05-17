export type ScrollHeadBehavior = "hide" | "compact" | "elevate";

export type ScrollHeadMode = "auto" | "hide" | "compact" | "elevate" | "hide-compact" | "none";

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

export interface ScrollHeadEventOverrides {
  scrollDown?: {
    after?: number | false;
    distance?: number;
  };
  scrollUp?: {
    distance?: number;
  };
  pass?: {
    y?: number;
  };
  returnBefore?: {
    y?: number;
  };
  progress?: {
    from?: number;
    to?: number;
  };
}

export interface ScrollHeadOutput {
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
}

export interface ScrollHeadOptions {
  /**
   * Preset behavior mode. Use `on` to override the derived scroll triggers.
   *
   * auto/hide-compact: hide, compact, and elevate.
   * hide: hide and elevate.
   * compact: compact and elevate.
   * elevate: expose top/away edge state only.
   * none: disable built-in behavior state changes.
   */
  mode?: ScrollHeadMode;
  /**
   * Main scroll position used to derive compact and hide triggers.
   */
  at?: number;
  /**
   * Position treated as the page top. Useful when the page has a tiny offset.
   */
  top?: number;
  /**
   * Distance before returning from compact to full size.
   */
  hysteresis?: number;
  /**
   * Semantic trigger overrides. These are normalized into the same internal
   * threshold model used by the scroll state machine.
   */
  on?: ScrollHeadEventOverrides;
  output?: ScrollHeadOutput;
  heights?: ScrollHeadHeights;
  /**
   * Window or scrollable element. Defaults to window.
   */
  root?: Window | HTMLElement;
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
