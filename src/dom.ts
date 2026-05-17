import { formatNumber } from "./math.js";
import type { NormalizedOptions, ScrollHeadClasses, ScrollHeadState } from "./types.js";

export function applyState(
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

export function getAttributeNames(prefix: string) {
  return {
    state: `${prefix}-state`,
    size: `${prefix}-size`,
    edge: `${prefix}-edge`,
    direction: "data-scroll-direction"
  };
}

export function getVariableNames(prefix: string) {
  return {
    y: `${prefix}-y`,
    progress: `${prefix}-progress`,
    height: `${prefix}-height`,
    visible: `${prefix}-visible`
  };
}

export function snapshotAttributes(element: HTMLElement, names: string[]) {
  return new Map(names.map((name) => [name, element.getAttribute(name)]));
}

export function restoreAttributes(element: HTMLElement, snapshot: Map<string, string | null>) {
  snapshot.forEach((value, name) => {
    if (value === null) {
      element.removeAttribute(name);
    } else {
      element.setAttribute(name, value);
    }
  });
}

export function snapshotVariables(element: HTMLElement, names: string[]) {
  return new Map(names.map((name) => [name, element.style.getPropertyValue(name)]));
}

export function restoreVariables(element: HTMLElement, snapshot: Map<string, string>) {
  snapshot.forEach((value, name) => {
    if (value) {
      element.style.setProperty(name, value);
    } else {
      element.style.removeProperty(name);
    }
  });
}

export function getClassNames(classes: Required<ScrollHeadClasses> | null): string[] {
  return classes ? Array.from(new Set(Object.values(classes).filter(Boolean))) : [];
}

export function snapshotClasses(element: HTMLElement, names: string[]) {
  return new Map(names.map((name) => [name, element.classList.contains(name)]));
}

export function restoreClasses(element: HTMLElement, snapshot: Map<string, boolean>) {
  snapshot.forEach((wasPresent, name) => {
    element.classList.toggle(name, wasPresent);
  });
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
