import type { View } from '../../types';
import { el } from '../../ui/dom';
import { t } from '../../core/i18n';

interface Destino {
  path: string;
  hanzi: string;
  titulo: string;
  desc: string;
}

const DESTINOS: readonly Destino[] = [
  { path: '/diagnostico', hanzi: '诊', titulo: 'Diagnóstico', desc: 'Calibra tu nivel actual' },
  { path: '/vocabulario', hanzi: '词', titulo: 'Vocabulario', desc: 'Repaso espaciado (SRS)' },
  { path: '/lectura', hanzi: '读', titulo: 'Lectura', desc: 'Textos con glosas' },
  { path: '/escucha', hanzi: '听', titulo: 'Escucha', desc: 'Dictado y tonos' },
  { path: '/escritura', hanzi: '写', titulo: 'Escritura', desc: 'Orden de trazos' },
  { path: '/progreso', hanzi: '进', titulo: 'Progreso', desc: 'Tu avance' },
];

export function createHomeView(): View {
  return {
    mount(root) {
      const grid = el('div', { class: 'home-grid' });
      for (const d of DESTINOS) {
        grid.append(
          el(
            'a',
            { class: 'card home-card', attrs: { href: `#${d.path}` } },
            el('span', {
              class: 'home-card__hanzi',
              attrs: { 'aria-hidden': 'true' },
              text: d.hanzi,
            }),
            el('span', { class: 'home-card__title', text: d.titulo }),
            el('span', { class: 'home-card__desc', text: d.desc }),
          ),
        );
      }
      root.append(
        el(
          'section',
          { class: 'home' },
          el('p', {
            class: 'home__lead',
            text: t('home.lead'),
          }),
          grid,
        ),
      );
    },
  };
}
