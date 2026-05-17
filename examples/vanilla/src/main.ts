import { createScrollHead } from "../../../src/index";
import "../../../styles/presets/blog.css";
import "./styles.css";

const header = document.querySelector<HTMLElement>(".site-header");
const status = {
  state: document.querySelector<HTMLElement>('[data-status="state"]'),
  size: document.querySelector<HTMLElement>('[data-status="size"]'),
  edge: document.querySelector<HTMLElement>('[data-status="edge"]'),
  direction: document.querySelector<HTMLElement>('[data-status="direction"]')
};

if (header) {
  createScrollHead(header, {
    behaviors: ["hide", "compact", "elevate"],
    classes: true,
    threshold: 96,
    hideDelta: 18,
    revealDelta: 8,
    heights: {
      full: 76,
      compact: 56
    },
    onChange({ state, changed }) {
      if (changed.visibility && status.state) status.state.textContent = state.visibility;
      if (changed.size && status.size) status.size.textContent = state.size;
      if (changed.edge && status.edge) status.edge.textContent = state.edge;
      if (changed.direction && status.direction) {
        status.direction.textContent = state.direction;
      }
    }
  });
}
