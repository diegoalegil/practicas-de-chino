import { Router, type Route } from './router/router';
import { routes } from './router/routes';
import { el } from './ui/dom';

/**
 * Shell de la app: cabecera con marca, outlet del router y barra de navegación
 * inferior estilo iOS. El Grupo C enriquece dashboard, instalación y offline.
 */
export function mountApp(root: HTMLElement): void {
  root.replaceChildren();

  const header = el(
    'header',
    { class: 'app-header' },
    el(
      'a',
      { class: 'app-header__brand', attrs: { href: '#/', 'aria-label': 'Inicio' } },
      el('span', { class: 'app-header__hanzi', attrs: { 'aria-hidden': 'true' }, text: '练' }),
      el('span', { class: 'app-header__title', text: 'Prácticas de Chino' }),
    ),
  );

  const outlet = el('main', { class: 'app-outlet', attrs: { id: 'outlet' } });

  const tabbar = el('nav', { class: 'tabbar', attrs: { 'aria-label': 'Navegación principal' } });
  const tabs = new Map<string, HTMLAnchorElement>();
  for (const route of routes) {
    if (!route.tab) {
      continue;
    }
    const tab = el(
      'a',
      { class: 'tab', attrs: { href: `#${route.path}` } },
      el('span', { class: 'tab__hanzi', attrs: { 'aria-hidden': 'true' }, text: route.hanzi }),
      el('span', { class: 'tab__label', text: route.label }),
    );
    tabs.set(route.path, tab);
    tabbar.append(tab);
  }

  root.append(el('div', { class: 'app-shell' }, header, outlet, tabbar));

  const router = new Router(outlet, routes, '/');
  router.onChange((route: Route) => {
    document.title =
      route.path === '/' ? 'Prácticas de Chino' : `${route.title} · Prácticas de Chino`;
    for (const [path, tab] of tabs) {
      const isActive = path === route.path;
      tab.classList.toggle('is-active', isActive);
      if (isActive) {
        tab.setAttribute('aria-current', 'page');
      } else {
        tab.removeAttribute('aria-current');
      }
    }
  });
  router.start();
}
