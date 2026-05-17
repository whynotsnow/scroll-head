import {
  applyState,
  getAttributeNames,
  getClassNames,
  getVariableNames,
  restoreAttributes,
  restoreClasses,
  restoreVariables,
  snapshotAttributes,
  snapshotClasses,
  snapshotVariables
} from "./dom.js";
import { normalizeOptions } from "./normalize.js";
import { getScrollTarget, getScrollY, getWindow } from "./scroll.js";
import {
  computeNextState,
  createScrollMemory,
  getChanged,
  getInitialState,
  hasChanged
} from "./state.js";
import type { ScrollHeadController, ScrollHeadOptions } from "./types.js";

export type {
  ScrollHeadBehavior,
  ScrollHeadChanged,
  ScrollHeadChangeEvent,
  ScrollHeadClasses,
  ScrollHeadController,
  ScrollHeadDirection,
  ScrollHeadEdge,
  ScrollHeadHeights,
  ScrollHeadOptions,
  ScrollHeadSize,
  ScrollHeadState,
  ScrollHeadVisibility
} from "./types.js";

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
  const memory = createScrollMemory();

  let state = getInitialState(config);
  let enabled = !config.disabled;
  let destroyed = false;
  let frame = 0;
  let previousY = getScrollY(config.root);

  const schedule = () => {
    if (!enabled || destroyed || frame) return;
    frame = getWindow(config.root).requestAnimationFrame(runUpdate);
  };

  const runUpdate = () => {
    frame = 0;
    const nextState = computeNextState(config, state, previousY, memory);
    const previousState = state;
    const changed = getChanged(previousState, nextState);
    previousY = nextState.y;

    state = nextState;
    applyState(element, state, config, attrNames, varNames);

    if (hasChanged(changed)) {
      config.onChange?.({
        element,
        state,
        previousState,
        changed
      });
    }
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
