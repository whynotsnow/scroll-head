export function getScrollY(root: Window | HTMLElement): number {
  return isWindow(root) ? root.scrollY || root.document.documentElement.scrollTop : root.scrollTop;
}

export function getScrollTarget(root: Window | HTMLElement): Window | HTMLElement {
  return root;
}

export function getWindow(root: Window | HTMLElement): Window {
  return isWindow(root) ? root : root.ownerDocument.defaultView ?? window;
}

function isWindow(value: Window | HTMLElement): value is Window {
  return "window" in value && value.window === value;
}
