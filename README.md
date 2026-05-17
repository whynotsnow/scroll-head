# @whynotsnow/scroll-head

面向博客、文档站和内容型页面的无头滚动头部控制器。

`scroll-head` 不渲染 header，也不绑定任何框架。它只监听滚动状态，并把一组稳定的 DOM 契约写到你的 header 上：`data-*` 属性、CSS 变量，以及可选 class。视觉样式、布局和动画都由你的 CSS 控制。

## 安装

```bash
npm install @whynotsnow/scroll-head
```

这个包是 ESM-only，适合现代打包器、Vite、Rollup、Webpack、Next.js / Nuxt / Astro 等客户端入口使用。因为核心默认会访问 `window`，如果在 SSR 环境中使用，请只在浏览器端初始化，或显式传入浏览器端可用的 `root`。

## 快速开始

```ts
import { createScrollHead } from "@whynotsnow/scroll-head";

const header = document.querySelector<HTMLElement>(".site-header");

if (header) {
  const controller = createScrollHead(header, {
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

  // 在页面卸载或组件销毁时调用。
  // controller.destroy();
}
```

默认情况下，控制器会写入类似这样的状态：

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

然后你可以直接用属性和 CSS 变量写样式：

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

## 预设样式

如果想更快启动，可以导入内置 CSS：

```ts
import { createScrollHead } from "@whynotsnow/scroll-head";
import "@whynotsnow/scroll-head/styles/presets/blog.css";

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

也可以只导入基础过渡层：

```ts
import "@whynotsnow/scroll-head/styles/base.css";
```

内置 CSS 很克制，只处理高度、隐藏、顶部/离顶状态、背景过渡和 reduced-motion。更具体的导航、品牌、菜单、响应式布局仍然交给你的项目样式。

## 滚动模式

`mode` 描述内置行为，`at` 是主要滚动触发点，`on` 可以覆盖具体阈值。

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

上面的配置表示：

- `0px` 到 `128px` 使用完整 header
- `128px` 到 `360px` 使用紧凑 header
- 超过 `360px` 后，继续向下滚动会自动隐藏
- 回滚到 `80px` 前恢复完整 header

可用模式：

- `auto` / `hide-compact`：隐藏、紧凑、离顶高亮
- `hide`：隐藏、离顶高亮
- `compact`：紧凑、离顶高亮
- `elevate`：只输出顶部/离顶状态
- `none`：关闭内置行为状态变化

如果只想保留紧凑和离顶效果，不想自动隐藏，可以用 `mode: "compact"`。如果想使用 `hide-compact` 但禁用隐藏阈值，可以设置 `on.scrollDown.after: false`。

## 输出契约

默认输出属性：

- `data-scroll-head-state`: `visible` / `hidden`
- `data-scroll-head-size`: `full` / `compact`
- `data-scroll-head-edge`: `top` / `away`
- `data-scroll-direction`: `idle` / `down` / `up`

默认输出 CSS 变量：

- `--scroll-head-y`
- `--scroll-head-progress`
- `--scroll-head-height`
- `--scroll-head-visible`

如果更偏好 class，可以打开 class 同步：

```ts
createScrollHead(header, {
  output: {
    classes: true
  }
});
```

默认 class：

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

也可以自定义 class 名：

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

## 边界规则

滚动距离会被规范化：

- 负数会变成 `0`
- `NaN`、`Infinity`、`-Infinity` 会回退到默认值
- 很大的有限数字会被保留，所以 `on.scrollDown.after: 100000` 可以用来推迟隐藏
- `on.scrollDown.after: false` 是明确禁用隐藏的方式
- `on.returnBefore.y` 会被限制在不大于紧凑触发点

## Change Events

`onChange` 会收到当前状态、上一次状态、变更字段和被控制的元素。

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

`changed` 的结构：

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

`destroy()` 会移除滚动和 resize 监听，并恢复初始化前由 `scroll-head` 管理的属性、CSS 变量和 class 状态。

## Options

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

## 调试与 source map

npm 包会同时发布 `dist` 和 `src`。`dist/*.js.map` 指向 `../src/*.ts`，所以在支持 source map 的调试器里可以回到 TypeScript 源文件。

## 本地开发

```bash
npm install
npm run dev
```

示例项目位于 `examples/vanilla`。

常用检查：

```bash
npm run typecheck
npm test
npm pack --dry-run
```

## English

`@whynotsnow/scroll-head` is a headless scroll-aware header controller for blogs, docs, and content-heavy sites.

It does not render a header. Instead, it observes scroll state and writes a small DOM contract to your header element: `data-*` attributes, CSS variables, and optional classes. Your CSS owns the layout, visuals, and transitions.

### Install

```bash
npm install @whynotsnow/scroll-head
```

The package is ESM-only. In SSR environments, initialize it only on the client, or pass a browser-side `root`.

### Basic Usage

```ts
import { createScrollHead } from "@whynotsnow/scroll-head";

const header = document.querySelector<HTMLElement>(".site-header");

if (header) {
  createScrollHead(header, {
    mode: "hide-compact",
    at: 96,
    heights: {
      full: 104,
      compact: 70
    }
  });
}
```

### Preset CSS

```ts
import "@whynotsnow/scroll-head/styles/presets/blog.css";
```

Or import only the base transition layer:

```ts
import "@whynotsnow/scroll-head/styles/base.css";
```

### API

```ts
const controller = createScrollHead(element, options);

controller.getState();
controller.update();
controller.disable();
controller.enable();
controller.destroy();
```

`destroy()` removes listeners and restores the attributes, CSS variables, and classes managed by `scroll-head`.
