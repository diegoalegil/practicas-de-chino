// Helper mínimo para construir DOM de forma declarativa y segura (sin innerHTML por defecto).

export interface ElAttrs {
  class?: string;
  text?: string;
  html?: string;
  dataset?: Record<string, string>;
  attrs?: Record<string, string>;
  on?: Record<string, EventListener>;
}

export function el<K extends keyof HTMLElementTagNameMap>(
  tag: K,
  attrs: ElAttrs = {},
  ...children: (Node | string)[]
): HTMLElementTagNameMap[K] {
  const node = document.createElement(tag);
  if (attrs.class !== undefined) {
    node.className = attrs.class;
  }
  if (attrs.text !== undefined) {
    node.textContent = attrs.text;
  }
  if (attrs.html !== undefined) {
    node.innerHTML = attrs.html;
  }
  if (attrs.dataset) {
    for (const [key, value] of Object.entries(attrs.dataset)) {
      node.dataset[key] = value;
    }
  }
  if (attrs.attrs) {
    for (const [key, value] of Object.entries(attrs.attrs)) {
      node.setAttribute(key, value);
    }
  }
  if (attrs.on) {
    for (const [type, handler] of Object.entries(attrs.on)) {
      node.addEventListener(type, handler);
    }
  }
  node.append(...children);
  return node;
}

export function clearChildren(node: Element): void {
  node.replaceChildren();
}
