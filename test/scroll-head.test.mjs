import assert from "node:assert/strict";
import test from "node:test";

import { createScrollHead } from "../dist/index.js";
import { normalizeOptions } from "../dist/normalize.js";

function createFakeRoot(scrollTop = 0) {
  const listeners = new Map();
  const defaultView = {
    addEventListener(type, listener) {
      listeners.set(`window:${type}`, listener);
    },
    removeEventListener(type) {
      listeners.delete(`window:${type}`);
    },
    requestAnimationFrame() {
      return 1;
    },
    cancelAnimationFrame() {}
  };

  return {
    scrollTop,
    ownerDocument: {
      defaultView
    },
    addEventListener(type, listener) {
      listeners.set(type, listener);
    },
    removeEventListener(type) {
      listeners.delete(type);
    },
    hasListener(type) {
      return listeners.has(type);
    }
  };
}

function createFakeElement() {
  const attributes = new Map();
  const variables = new Map();
  const classes = new Set();

  return {
    style: {
      setProperty(name, value) {
        variables.set(name, value);
      },
      getPropertyValue(name) {
        return variables.get(name) ?? "";
      },
      removeProperty(name) {
        variables.delete(name);
      }
    },
    classList: {
      add(...names) {
        for (const name of names) classes.add(name);
      },
      contains(name) {
        return classes.has(name);
      },
      toggle(name, force) {
        const shouldAdd = force ?? !classes.has(name);
        if (shouldAdd) {
          classes.add(name);
        } else {
          classes.delete(name);
        }
        return shouldAdd;
      }
    },
    setAttribute(name, value) {
      attributes.set(name, String(value));
    },
    getAttribute(name) {
      return attributes.has(name) ? attributes.get(name) : null;
    },
    removeAttribute(name) {
      attributes.delete(name);
    }
  };
}

test("normalizeOptions clamps invalid distances and supports disabling hide", () => {
  const root = createFakeRoot();
  const config = normalizeOptions({
    root,
    at: Number.NaN,
    top: -20,
    hysteresis: Number.POSITIVE_INFINITY,
    on: {
      scrollDown: {
        after: false,
        distance: -3
      },
      scrollUp: {
        distance: Number.NEGATIVE_INFINITY
      },
      returnBefore: {
        y: 10_000
      }
    }
  });

  assert.equal(config.compactAt, 80);
  assert.equal(config.topThreshold, 0);
  assert.equal(config.hideAfter, Number.POSITIVE_INFINITY);
  assert.equal(config.hideDistance, 0);
  assert.equal(config.revealDistance, 8);
  assert.equal(config.restoreCompactAt, 80);
});

test("createScrollHead updates scroll state, attributes, css variables, and classes", () => {
  const root = createFakeRoot();
  const element = createFakeElement();
  const changes = [];
  const controller = createScrollHead(element, {
    root,
    at: 80,
    on: {
      scrollDown: {
        after: 100,
        distance: 10
      },
      scrollUp: {
        distance: 8
      }
    },
    output: {
      classes: true
    },
    onChange(event) {
      changes.push(event.changed);
    }
  });

  assert.equal(element.getAttribute("data-scroll-head-state"), "visible");
  assert.equal(element.getAttribute("data-scroll-head-size"), "full");
  assert.equal(element.getAttribute("data-scroll-head-edge"), "top");
  assert.equal(element.style.getPropertyValue("--scroll-head-visible"), "1");
  assert.equal(element.classList.contains("scroll-head--visible"), true);

  root.scrollTop = 120;
  controller.update();

  assert.equal(controller.getState().visibility, "hidden");
  assert.equal(controller.getState().size, "compact");
  assert.equal(controller.getState().edge, "away");
  assert.equal(element.getAttribute("data-scroll-direction"), "down");
  assert.equal(element.style.getPropertyValue("--scroll-head-visible"), "0");
  assert.equal(element.classList.contains("scroll-head--hidden"), true);

  root.scrollTop = 110;
  controller.update();

  assert.equal(controller.getState().visibility, "visible");
  assert.equal(controller.getState().direction, "up");
  assert.equal(changes.length >= 2, true);
});

test("destroy restores owned DOM attributes, css variables, classes, and listeners", () => {
  const root = createFakeRoot();
  const element = createFakeElement();
  element.setAttribute("data-scroll-head-state", "custom");
  element.style.setProperty("--scroll-head-height", "99px");
  element.classList.add("scroll-head", "keep-me");

  const controller = createScrollHead(element, {
    root,
    output: {
      classes: true
    }
  });

  assert.equal(root.hasListener("scroll"), true);
  assert.equal(root.hasListener("window:resize"), true);
  assert.equal(element.classList.contains("scroll-head--visible"), true);

  controller.destroy();

  assert.equal(element.getAttribute("data-scroll-head-state"), "custom");
  assert.equal(element.getAttribute("data-scroll-head-size"), null);
  assert.equal(element.style.getPropertyValue("--scroll-head-height"), "99px");
  assert.equal(element.classList.contains("scroll-head"), true);
  assert.equal(element.classList.contains("scroll-head--visible"), false);
  assert.equal(element.classList.contains("keep-me"), true);
  assert.equal(root.hasListener("scroll"), false);
  assert.equal(root.hasListener("window:resize"), false);
});
