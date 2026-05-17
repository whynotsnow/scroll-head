# scroll-head

Headless scroll-aware header controller for blogs, docs, and simple product sites.

`scroll-head` does not render a header. The core watches scroll state and writes a small DOM contract to your header: `data-*` attributes, CSS variables, and optional classes. Your CSS owns the visual design and transitions.

## Install

```bash
npm install scroll-head
```

## Development

```bash
npm install
npm run dev
```

The dev server runs a vanilla demo from `examples/vanilla`.

## Headless Core

Use the core when you want full control over markup and styles.

```ts
import { createScrollHead } from "scroll-head";

const header = document.querySelector<HTMLElement>(".site-header");

if (header) {
  createScrollHead(header, {
    mode: "hide-compact",
    at: 96,
    on: {
      scrollDown: {
        after: 320,
        distance: 24
      },
      scrollUp: {
        distance: 8
      }
    },
    heights: {
      full: 104,
      compact: 70
    }
  });
}
```

By default the controller writes:

```html
<header
  data-scroll-head-state="visible"
  data-scroll-head-size="compact"
  data-scroll-head-edge="away"
  data-scroll-direction="down"
  style="--scroll-head-height: 70px; --scroll-head-progress: 1;"
>
</header>
```

You can style directly against attributes and variables:

```css
.site-header {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  height: var(--scroll-head-height, 104px);
  transform: translate3d(0, 0, 0);
  transition:
    height 220ms cubic-bezier(0.22, 1, 0.36, 1),
    transform 220ms cubic-bezier(0.22, 1, 0.36, 1),
    background-color 180ms ease,
    box-shadow 180ms ease;
}

.site-header[data-scroll-head-state="hidden"] {
  transform: translate3d(0, -100%, 0);
}

.site-header[data-scroll-head-edge="away"] {
  background: rgb(255 255 255 / 0.9);
  box-shadow: 0 1px 0 rgb(0 0 0 / 0.08);
}
```

## Quick Preset Styles

For a faster start, add the base class and import the blog preset:

```ts
import { createScrollHead } from "scroll-head";
import "scroll-head/styles/presets/blog.css";

createScrollHead(document.querySelector(".site-header")!, {
  output: {
    classes: true
  }
});
```

```html
<header class="site-header scroll-head scroll-head-blog">
  ...
</header>
```

The preset is intentionally small. It uses a fixed overlay header for stable height transitions, and covers height/transform transitions, top versus away background, and reduced-motion behavior. You can also import only the base transition layer:

```ts
import "scroll-head/styles/base.css";
```

## Scroll Modes

The main scroll options describe intent first. `mode` chooses the built-in behavior,
`at` sets the primary scroll position, and `on` can override individual trigger
values when you need finer control.

```ts
createScrollHead(header, {
  mode: "hide-compact",
  at: 128,
  hysteresis: 48,
  on: {
    scrollDown: {
      after: 360
    }
  },
  heights: {
    full: 112,
    compact: 72
  }
});
```

This creates:

- full header from the top to `128px`
- compact pinned header from `128px` to `360px`
- auto-hide behavior after `360px`
- full header again when scrolling back to `80px`

Available modes:

- `auto` and `hide-compact`: hide, compact, and elevate
- `hide`: hide and elevate
- `compact`: compact and elevate
- `elevate`: expose top/away edge state only
- `none`: disable built-in behavior state changes

`mode: "compact"` keeps compact and elevate behavior without automatic hiding.
`on.scrollDown.after: false` disables automatic hiding while keeping the selected mode.

## Option Boundaries

Numeric scroll distances are normalized:

- negative numbers become `0`
- `NaN`, `Infinity`, and `-Infinity` fall back to defaults
- very large finite values are allowed, so `on.scrollDown.after: 100000` effectively delays hiding until that scroll position
- `on.scrollDown.after: false` is the explicit way to never hide
- `on.returnBefore.y` is clamped so it cannot be greater than the compact trigger

## Optional Classes

Attributes are the default styling contract. If you prefer class-based CSS, enable class syncing:

```ts
createScrollHead(header, {
  output: {
    classes: true
  }
});
```

Default classes:

```html
<header
  class="
    scroll-head
    scroll-head--visible
    scroll-head--compact
    scroll-head--away
    scroll-head--direction-down
  "
>
</header>
```

You can customize class names:

```ts
createScrollHead(header, {
  output: {
    classes: {
      root: "site-head",
      hidden: "is-hidden",
      compact: "is-compact",
      away: "is-elevated"
    }
  }
});
```

## Change Events

`onChange` receives the current state, previous state, changed fields, and the controlled element.

```ts
createScrollHead(header, {
  onChange({ state, previousState, changed, element }) {
    if (changed.visibility) {
      element.classList.toggle("just-hid", state.visibility === "hidden");
    }

    console.log(previousState.visibility, "->", state.visibility);
  }
});
```

The `changed` object contains:

```ts
{
  visibility: boolean;
  size: boolean;
  edge: boolean;
  direction: boolean;
  y: boolean;
  progress: boolean;
  height: boolean;
}
```

## API

```ts
const controller = createScrollHead(element, options);

controller.getState();
controller.update();
controller.disable();
controller.enable();
controller.destroy();
```

### Options

```ts
interface ScrollHeadOptions {
  mode?: "auto" | "hide" | "compact" | "elevate" | "hide-compact" | "none";
  at?: number;
  top?: number;
  hysteresis?: number;
  on?: {
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
  };
  output?: {
    attributePrefix?: string;
    cssVarPrefix?: string;
    attributes?: boolean;
    cssVars?: boolean;
    classes?: boolean | ScrollHeadClasses;
  };
  heights?: {
    full?: number | string;
    compact?: number | string;
  };
  root?: Window | HTMLElement;
  disabled?: boolean;
  onChange?: (event: ScrollHeadChangeEvent) => void;
}
```

## Design Notes

The first version uses a small scroll state machine with `requestAnimationFrame`. That keeps direction-aware behavior reliable while leaving animation work to CSS transitions. Framework adapters can build on this core without changing the DOM contract.
