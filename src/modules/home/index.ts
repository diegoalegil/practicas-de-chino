import type { View } from '../../types';
import { el } from '../../ui/dom';
import { t } from '../../core/i18n';
import { asegurarTarjetas, tarjetasVencidas } from '../vocab/cards';
import './home.css';

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

async function contarRepasosPendientes(): Promise<number> {
  try {
    const ahora = new Date();
    await asegurarTarjetas(ahora);
    return (await tarjetasVencidas(ahora)).length;
  } catch {
    return 0;
  }
}

function heroRepaso(due: number): HTMLElement {
  if (due === 0) {
    return el(
      'div',
      { class: 'home-hero card' },
      el('span', { class: 'home-hero__hanzi', attrs: { 'aria-hidden': 'true' }, text: '净' }),
      el(
        'div',
        { class: 'home-hero__cuerpo' },
        el('p', { class: 'home-hero__titulo', text: '¡Todo al día!' }),
        el('p', { class: 'home-hero__sub', text: 'No te quedan repasos pendientes. 复习完毕。' }),
      ),
    );
  }
  return el(
    'a',
    { class: 'home-hero home-hero--accion card', attrs: { href: '#/vocabulario' } },
    el('span', { class: 'home-hero__num', text: String(due) }),
    el(
      'div',
      { class: 'home-hero__cuerpo' },
      el('p', {
        class: 'home-hero__titulo',
        text: due === 1 ? 'tarjeta por repasar' : 'tarjetas por repasar',
      }),
      el('p', { class: 'home-hero__sub', text: 'Toca para empezar tu repaso →' }),
    ),
  );
}

export function createHomeView(): View {
  return {
    async mount(root) {
      const due = await contarRepasosPendientes();

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

      root.replaceChildren(
        el(
          'section',
          { class: 'home' },
          el('p', { class: 'home__lead', text: t('home.lead') }),
          heroRepaso(due),
          el('h2', { class: 'home__seccion', text: 'Practicar' }),
          grid,
        ),
      );
    },
  };
}
