import { createScrollHead } from "../../../src/index";
import "../../../styles/presets/blog.css";
import "./styles.css";

const header = document.querySelector<HTMLElement>(".site-header");
const status = {
  state: document.querySelector<HTMLElement>('[data-status="state"]'),
  size: document.querySelector<HTMLElement>('[data-status="size"]'),
  edge: document.querySelector<HTMLElement>('[data-status="edge"]'),
  direction: document.querySelector<HTMLElement>('[data-status="direction"]'),
};

if (header) {
  createScrollHead(header, {
    mode: "compact",
    at: 300,
    hysteresis: 80,
  });
}
