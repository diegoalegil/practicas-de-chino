import type { View } from '../../types';
import { el } from '../../ui/dom';
import { getAll } from '../../core/storage';
import './progress.css';
import {
  calcularDominio,
  maximoDiario,
  nivelIntensidad,
  repasosPorDia,
  resumenEstadisticas,
  type DiaRepasos,
  type Dominio,
  type LogReview,
  type ResumenEstadisticas,
  type TarjetaConFsrs,
} from './stats.logic';

const SEMANAS = 12;
const SVG_NS = 'http://www.w3.org/2000/svg';
const CELDA = 13; // lado de cada celda (px)
const HUECO = 3; // separación entre celdas (px)
const PASO = CELDA + HUECO;
const MARGEN_SUP = 16; // espacio para etiquetas de mes
const MARGEN_IZQ = 22; // espacio para etiquetas de día

const NOMBRES_MES = [
  'Ene',
  'Feb',
  'Mar',
  'Abr',
  'May',
  'Jun',
  'Jul',
  'Ago',
  'Sep',
  'Oct',
  'Nov',
  'Dic',
];

const ETIQUETAS_DOMINIO: { clave: keyof Dominio; etiqueta: string }[] = [
  { clave: 'maduras', etiqueta: 'Maduras' },
  { clave: 'jovenes', etiqueta: 'Jóvenes' },
  { clave: 'aprendiendo', etiqueta: 'Aprendiendo' },
  { clave: 'nuevas', etiqueta: 'Nuevas' },
];

function svgEl<K extends keyof SVGElementTagNameMap>(
  tag: K,
  atributos: Record<string, string>,
): SVGElementTagNameMap[K] {
  const node = document.createElementNS(SVG_NS, tag);
  for (const [clave, valor] of Object.entries(atributos)) {
    node.setAttribute(clave, valor);
  }
  return node;
}

function encabezadoSeccion(titulo: string, jade = false): HTMLElement {
  return el(
    'div',
    { class: 'prog-sec-h' },
    el('span', { class: 'prog-sec-t', text: titulo }),
    el('span', { class: `prog-brush${jade ? ' prog-brush--jade' : ''}` }),
  );
}

function tarjetaResumen(valor: string, etiqueta: string, tono: string): HTMLElement {
  return el(
    'div',
    { class: 'prog-stat' },
    el('span', { class: `prog-stat-num ${tono}`, text: valor }),
    el('span', { class: 'prog-stat-lbl', text: etiqueta }),
  );
}

function renderResumen(resumen: ResumenEstadisticas): HTMLElement {
  return el(
    'div',
    { class: 'prog-stat-grid' },
    tarjetaResumen(
      `${String(resumen.racha)}`,
      resumen.racha === 1 ? 'día de racha' : 'días de racha',
      'prog-stat-num--seal',
    ),
    tarjetaResumen(`${String(resumen.totalRepasos)}`, 'repasos', ''),
    tarjetaResumen(`${String(resumen.porcentajeAcierto)}%`, 'acierto', 'prog-stat-num--jade'),
  );
}

function renderHeatmap(dias: readonly DiaRepasos[]): HTMLElement {
  const maximo = maximoDiario(dias);
  const columnas = Math.ceil(dias.length / 7);
  const ancho = MARGEN_IZQ + columnas * PASO;
  const alto = MARGEN_SUP + 7 * PASO;

  const svg = svgEl('svg', {
    viewBox: `0 0 ${String(ancho)} ${String(alto)}`,
    width: '100%',
    role: 'img',
    'aria-label': 'Mapa de calor de repasos de las últimas 12 semanas',
    class: 'prog-heat-svg',
  });

  // Etiquetas de día (Lun, Mié, Vie) en su fila correspondiente (0=Dom..6=Sáb).
  const etiquetasDia: { fila: number; texto: string }[] = [
    { fila: 1, texto: 'Lun' },
    { fila: 3, texto: 'Mié' },
    { fila: 5, texto: 'Vie' },
  ];
  for (const { fila, texto } of etiquetasDia) {
    const txt = svgEl('text', {
      x: '0',
      y: `${String(MARGEN_SUP + fila * PASO + CELDA - 2)}`,
      class: 'prog-heat-label',
    });
    txt.textContent = texto;
    svg.appendChild(txt);
  }

  let mesPrevio = -1;
  dias.forEach((dia, i) => {
    const columna = Math.floor(i / 7);
    const fila = i % 7;
    const x = MARGEN_IZQ + columna * PASO;
    const y = MARGEN_SUP + fila * PASO;

    // Etiqueta de mes en la primera fila de cada columna donde cambia el mes.
    if (fila === 0) {
      const mes = new Date(`${dia.fecha}T00:00:00`).getMonth();
      if (mes !== mesPrevio) {
        mesPrevio = mes;
        const nombre = NOMBRES_MES[mes];
        if (nombre !== undefined) {
          const txt = svgEl('text', {
            x: `${String(x)}`,
            y: `${String(MARGEN_SUP - 5)}`,
            class: 'prog-heat-label',
          });
          txt.textContent = nombre;
          svg.appendChild(txt);
        }
      }
    }

    const nivel = nivelIntensidad(dia.total, maximo);
    const rect = svgEl('rect', {
      x: `${String(x)}`,
      y: `${String(y)}`,
      width: `${String(CELDA)}`,
      height: `${String(CELDA)}`,
      rx: '2',
      class: `prog-hc prog-hc--n${String(nivel)}`,
    });
    const etiqueta =
      dia.total === 1 ? `${dia.fecha}: 1 repaso` : `${dia.fecha}: ${String(dia.total)} repasos`;
    const titulo = svgEl('title', {});
    titulo.textContent = etiqueta;
    rect.appendChild(titulo);
    svg.appendChild(rect);
  });

  const leyenda = el(
    'div',
    { class: 'prog-heat-leyenda' },
    el('span', { class: 'prog-heat-leyenda-txt', text: 'Menos' }),
    ...[0, 1, 2, 3, 4].map((n) =>
      el('span', { class: `prog-heat-muestra prog-hc--n${String(n)}` }),
    ),
    el('span', { class: 'prog-heat-leyenda-txt', text: 'Más' }),
  );

  return el(
    'section',
    { class: 'prog-card' },
    encabezadoSeccion('Actividad', true),
    el('div', { class: 'prog-heat-scroll' }, svg),
    leyenda,
  );
}

function renderDominio(dominio: Dominio): HTMLElement {
  const total = dominio.nuevas + dominio.aprendiendo + dominio.jovenes + dominio.maduras;

  const filas = ETIQUETAS_DOMINIO.map(({ clave, etiqueta }) => {
    const valor = dominio[clave];
    const pct = total === 0 ? 0 : Math.round((valor / total) * 100);
    return el(
      'div',
      { class: 'prog-bl' },
      el('span', { class: 'prog-bl-l', text: etiqueta }),
      el(
        'div',
        { class: 'prog-bl-t' },
        el('i', {
          class: `prog-bl-fill prog-bl-fill--${clave}`,
          attrs: { style: `width: ${String(pct)}%` },
        }),
      ),
      el('span', { class: 'prog-bl-v', text: String(valor) }),
    );
  });

  return el(
    'section',
    { class: 'prog-card' },
    encabezadoSeccion('Dominio'),
    el(
      'p',
      { class: 'prog-dominio-intro' },
      el('span', { text: `${String(total)} ` }),
      el('span', { text: total === 1 ? 'tarjeta en tu baraja' : 'tarjetas en tu baraja' }),
    ),
    ...filas,
  );
}

function renderVacio(): HTMLElement {
  return el(
    'section',
    { class: 'prog-vacio' },
    el('p', { class: 'prog-vacio-icono', attrs: { 'aria-hidden': 'true' }, text: '墨' }),
    el('p', {
      class: 'prog-vacio-titulo',
      text: 'Aún no hay nada que medir',
    }),
    el('p', {
      class: 'prog-vacio-texto',
      text: 'Haz tu primer repaso y aquí verás tu racha, tu progreso y un mapa de tu constancia.',
    }),
    el('a', {
      class: 'prog-btn prog-btn--primary prog-btn--block',
      attrs: { href: '#/' },
      text: 'Empezar a repasar',
    }),
  );
}

export function createProgressView(): View {
  let root: HTMLElement;

  function render(reviews: readonly LogReview[], cards: readonly TarjetaConFsrs[]): void {
    if (reviews.length === 0 && cards.length === 0) {
      root.replaceChildren(el('section', { class: 'prog scr' }, renderVacio()));
      return;
    }

    const ahora = new Date();
    const resumen = resumenEstadisticas(reviews, ahora);
    const dias = repasosPorDia(reviews, ahora, SEMANAS);
    const dominio = calcularDominio(cards);

    const contenido = el(
      'section',
      { class: 'prog scr' },
      el('h1', { class: 'prog-titulo', text: 'Tu progreso' }),
      renderResumen(resumen),
      renderHeatmap(dias),
      renderDominio(dominio),
    );

    if (reviews.length === 0) {
      contenido.insertBefore(
        el('p', {
          class: 'prog-nota',
          text: 'Todavía no has repasado: empieza para llenar tu mapa.',
        }),
        contenido.children[1] ?? null,
      );
    }

    root.replaceChildren(contenido);
  }

  return {
    async mount(target) {
      root = target;
      root.replaceChildren(
        el('p', { class: 'prog-cargando', text: 'Calculando tus estadísticas…' }),
      );
      const [reviews, cards] = await Promise.all([
        getAll<LogReview>('reviews'),
        getAll<TarjetaConFsrs>('cards'),
      ]);
      render(reviews, cards);
    },
  };
}
