import type { View } from '../types';

export interface Route {
  path: string; // '/vocabulario'
  title: string; // título completo (header / document.title)
  label: string; // etiqueta corta de la tabbar
  hanzi: string; // icono hanzi de la tabbar
  tab: boolean; // ¿aparece en la barra inferior?
  load: () => View | Promise<View>;
}

/** Normaliza el hash de la URL a una ruta (`#/vocabulario` -> `/vocabulario`). */
export function normalizeHash(hash: string, fallback: string): string {
  const path = hash.replace(/^#/, '').trim();
  return path === '' ? fallback : path;
}

/** Resuelve la ruta activa; si no hay coincidencia, cae a la ruta de respaldo. */
export function matchRoute(
  hash: string,
  routes: readonly Route[],
  fallback: string,
): Route | undefined {
  const path = normalizeHash(hash, fallback);
  return (
    routes.find((route) => route.path === path) ?? routes.find((route) => route.path === fallback)
  );
}

/** Router hash-based: inmune al base path de GitHub Pages (todo cuelga de index.html). */
export class Router {
  private active: View | undefined;
  private readonly listeners = new Set<(route: Route) => void>();

  constructor(
    private readonly outlet: HTMLElement,
    private readonly routes: readonly Route[],
    private readonly fallback: string,
  ) {}

  onChange(listener: (route: Route) => void): void {
    this.listeners.add(listener);
  }

  start(): void {
    window.addEventListener('hashchange', () => {
      void this.render();
    });
    void this.render();
  }

  async render(): Promise<void> {
    const route = matchRoute(window.location.hash, this.routes, this.fallback);
    if (!route) {
      return;
    }
    this.active?.unmount?.();
    this.outlet.replaceChildren();
    const view = await route.load();
    this.active = view;
    await view.mount(this.outlet);
    this.outlet.scrollTo?.({ top: 0, behavior: 'instant' });
    for (const listener of this.listeners) {
      listener(route);
    }
  }
}
