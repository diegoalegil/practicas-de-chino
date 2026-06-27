import type { View } from '../../types';
import { el } from '../../ui/dom';
import { getAll } from '../../core/storage';
import { asegurarTarjetas, tarjetasVencidas } from '../vocab/cards';
import type { LogReview } from '../vocab/types';
import { claveDia, rachaActual, totalRepasos } from '../progress/stats.logic';
import { debeRecordarBackup, leerUltimoBackup } from '../../core/backup-reminder';
import './home.css';

interface Quick {
  path: string;
  glyph: string;
  titulo: string;
  desc: string;
}

const QUICK: readonly Quick[] = [
  { path: '/vocabulario', glyph: '词', titulo: 'Vocabulario', desc: 'Repaso espaciado' },
  { path: '/lectura', glyph: '读', titulo: 'Lectura', desc: 'Textos con glosas' },
  { path: '/escucha', glyph: '听', titulo: 'Escucha', desc: 'Dictado y tonos' },
  { path: '/escritura', glyph: '写', titulo: 'Escritura', desc: 'Orden de trazos' },
];

interface Resumen {
  due: number;
  hechosHoy: number;
  total: number;
  acierto: number;
  racha: number;
}

async function cargarResumen(ahora: Date): Promise<Resumen> {
  try {
    await asegurarTarjetas(ahora);
    const [vencidas, reviews] = await Promise.all([
      tarjetasVencidas(ahora),
      getAll<LogReview>('reviews'),
    ]);
    const hoy = claveDia(ahora.getTime());
    const hechosHoy = reviews.filter((r) => claveDia(r.fecha) === hoy).length;
    const aciertos = reviews.filter((r) => r.grado >= 3).length;
    const total = totalRepasos(reviews);
    const acierto = total > 0 ? Math.round((aciertos / total) * 100) : 0;
    return { due: vencidas.length, hechosHoy, total, acierto, racha: rachaActual(reviews, ahora) };
  } catch {
    return { due: 0, hechosHoy: 0, total: 0, acierto: 0, racha: 0 };
  }
}

function saludo(hora: number): { es: string; zh: string } {
  if (hora < 12) {
    return { es: 'Buenos días', zh: '早上好' };
  }
  if (hora < 20) {
    return { es: 'Buenas tardes', zh: '下午好' };
  }
  return { es: 'Buenas noches', zh: '晚上好' };
}

function anilloSvg(fraccion: number): string {
  const circ = 263.89;
  const off = circ * (1 - Math.max(0, Math.min(1, fraccion)));
  return (
    `<svg class="home-ring" viewBox="0 0 96 96" aria-hidden="true">` +
    `<circle class="home-ring__bg" cx="48" cy="48" r="42"></circle>` +
    `<circle class="home-ring__fg" cx="48" cy="48" r="42" ` +
    `style="stroke-dasharray:${String(circ)};stroke-dashoffset:${String(off)}"></circle>` +
    `</svg>`
  );
}

export function createHomeView(): View {
  return {
    async mount(root) {
      const ahora = new Date();
      const r = await cargarResumen(ahora);
      const s = saludo(ahora.getHours());
      const fraccion = r.hechosHoy + r.due > 0 ? r.hechosHoy / (r.hechosHoy + r.due) : 0;

      // Hero
      const hero = el(
        'section',
        { class: 'home-hero' },
        el('span', { class: 'home-hero__wm', attrs: { 'aria-hidden': 'true' }, text: '练' }),
        el('p', { class: 'home-hero__saludo', text: `${s.es} · ${s.zh}` }),
        el('h1', { class: 'home-hero__titulo', text: 'Despierta tu chino, paso a paso.' }),
        el('span', { class: 'home-hero__brush', attrs: { 'aria-hidden': 'true' } }),
        el('a', {
          class: 'home-btn home-btn--ghost',
          attrs: { href: '#/diagnostico' },
          text: 'Calibrar mi nivel',
        }),
      );

      // Anillo de repaso del día
      const anillo = el(
        'a',
        { class: 'home-daily card', attrs: { href: '#/vocabulario' } },
        el(
          'div',
          { class: 'home-ringwrap' },
          el('div', { class: 'home-ring-host', html: anilloSvg(fraccion) }),
          el('span', { class: 'home-ring__num', text: String(r.due) }),
        ),
        el(
          'div',
          { class: 'home-daily__body' },
          el('p', { class: 'home-daily__t', text: 'Repaso del día' }),
          el('p', {
            class: 'home-daily__s',
            text:
              r.due === 0
                ? '¡Todo al día! Vuelve más tarde.'
                : `${String(r.due)} ${r.due === 1 ? 'tarjeta pendiente' : 'tarjetas pendientes'} · Continuar →`,
          }),
        ),
      );

      // Stats
      const stat = (num: string, lbl: string): HTMLElement =>
        el(
          'div',
          { class: 'home-stat' },
          el('span', { class: 'home-stat__n', text: num }),
          el('span', { class: 'home-stat__l', text: lbl }),
        );
      const stats = el(
        'div',
        { class: 'home-stats' },
        stat(String(r.racha), r.racha === 1 ? 'día de racha' : 'días de racha'),
        stat(String(r.total), 'repasos'),
        stat(`${String(r.acierto)}%`, 'acierto'),
      );

      // Quick
      const quick = el('div', { class: 'home-quick' });
      for (const q of QUICK) {
        quick.append(
          el(
            'a',
            { class: 'home-qcard', attrs: { href: `#${q.path}` } },
            el('span', {
              class: 'home-qcard__wm',
              attrs: { 'aria-hidden': 'true' },
              text: q.glyph,
            }),
            el('span', { class: 'home-qcard__g', attrs: { 'aria-hidden': 'true' }, text: q.glyph }),
            el('span', { class: 'home-qcard__t', text: q.titulo }),
            el('span', { class: 'home-qcard__d', text: q.desc }),
          ),
        );
      }

      const seccion = el(
        'div',
        { class: 'home-sec' },
        el('span', { class: 'home-sec__t', text: 'Practicar' }),
        el('span', { class: 'home-sec__brush', attrs: { 'aria-hidden': 'true' } }),
      );

      const hijos: Node[] = [hero, anillo];
      if (debeRecordarBackup(leerUltimoBackup(), Date.now())) {
        hijos.push(
          el(
            'a',
            { class: 'home-daily card', attrs: { href: '#/ajustes' } },
            el(
              'div',
              { class: 'home-daily__body' },
              el('p', { class: 'home-daily__t', text: 'Haz una copia de seguridad' }),
              el('p', {
                class: 'home-daily__s',
                text: 'Hace tiempo que no exportas tus datos. Guárdalos por si acaso →',
              }),
            ),
          ),
        );
      }
      hijos.push(stats, seccion, quick);

      root.replaceChildren(el('section', { class: 'home' }, ...hijos));
    },
  };
}
