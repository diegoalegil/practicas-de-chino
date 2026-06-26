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

const ETIQUETAS_DOMINIO: { clave: keyof Dominio; etiqueta: string; clase: string }[] = [
  { clave: 'maduras', etiqueta: 'Maduras', clase: 'progress-dominio__barra--maduras' },
  { clave: 'jovenes', etiqueta: 'Jóvenes', clase: 'progress-dominio__barra--jovenes' },
  { clave: 'aprendiendo', etiqueta: 'Aprendiendo', clase: 'progress-dominio__barra--aprendiendo' },
  { clave: 'nuevas', etiqueta: 'Nuevas', clase: 'progress-dominio__barra--nuevas' },
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

function tarjetaResumen(valor: string, etiqueta: string, clase: string): HTMLElement {
  return el(
    'div',
    { class: `progress-stat ${clase}` },
    el('span', { class: 'progress-stat__valor', text: valor }),
    el('span', { class: 'progress-stat__etiqueta', text: etiqueta }),
  );
}

function renderResumen(resumen: ResumenEstadisticas): HTMLElement {
  return el(
    'div',
    { class: 'progress-stats' },
    tarjetaResumen(
      `${String(resumen.racha)}`,
      resumen.racha === 1 ? 'día de racha' : 'días de racha',
      'progress-stat--racha',
    ),
    tarjetaResumen(`${String(resumen.totalRepasos)}`, 'repasos', 'progress-stat--total'),
    tarjetaResumen(`${String(resumen.porcentajeAcierto)}%`, 'acierto', 'progress-stat--acierto'),
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
    class: 'progress-heatmap__svg',
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
      class: 'progress-heatmap__label',
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
            class: 'progress-heatmap__label',
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
      rx: '3',
      class: `progress-heatmap__celda progress-heatmap__celda--n${String(nivel)}`,
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
    { class: 'progress-heatmap__leyenda' },
    el('span', { class: 'progress-heatmap__leyenda-texto', text: 'Menos' }),
    ...[0, 1, 2, 3, 4].map((n) =>
      el('span', { class: `progress-heatmap__muestra progress-heatmap__celda--n${String(n)}` }),
    ),
    el('span', { class: 'progress-heatmap__leyenda-texto', text: 'Más' }),
  );

  return el(
    'section',
    { class: 'progress-heatmap' },
    el('h2', { class: 'progress-seccion__titulo', text: 'Actividad' }),
    el('div', { class: 'progress-heatmap__scroll' }, svg),
    leyenda,
  );
}

function renderDominio(dominio: Dominio): HTMLElement {
  const total = dominio.nuevas + dominio.aprendiendo + dominio.jovenes + dominio.maduras;

  const filas = ETIQUETAS_DOMINIO.map(({ clave, etiqueta, clase }) => {
    const valor = dominio[clave];
    const pct = total === 0 ? 0 : Math.round((valor / total) * 100);
    return el(
      'div',
      { class: 'progress-dominio__fila' },
      el('span', { class: 'progress-dominio__etiqueta', text: etiqueta }),
      el(
        'div',
        { class: 'progress-dominio__pista' },
        el('div', {
          class: `progress-dominio__barra ${clase}`,
          attrs: { style: `width: ${String(pct)}%` },
        }),
      ),
      el('span', { class: 'progress-dominio__valor', text: String(valor) }),
    );
  });

  return el(
    'section',
    { class: 'progress-dominio' },
    el('h2', { class: 'progress-seccion__titulo', text: 'Dominio' }),
    el(
      'p',
      { class: 'progress-dominio__intro' },
      el('span', { text: `${String(total)} ` }),
      el('span', { text: total === 1 ? 'tarjeta en tu baraja' : 'tarjetas en tu baraja' }),
    ),
    ...filas,
  );
}

function renderVacio(): HTMLElement {
  return el(
    'section',
    { class: 'progress-vacio' },
    el('p', { class: 'progress-vacio__icono', attrs: { 'aria-hidden': 'true' }, text: '墨' }),
    el('p', {
      class: 'progress-vacio__titulo',
      text: 'Aún no hay nada que medir',
    }),
    el('p', {
      class: 'progress-vacio__texto',
      text: 'Haz tu primer repaso y aquí verás tu racha, tu progreso y un mapa de tu constancia.',
    }),
    el('a', { class: 'btn btn--tinta', attrs: { href: '#/' }, text: 'Empezar a repasar' }),
  );
}

export function createProgressView(): View {
  let root: HTMLElement;

  function render(reviews: readonly LogReview[], cards: readonly TarjetaConFsrs[]): void {
    if (reviews.length === 0 && cards.length === 0) {
      root.replaceChildren(el('section', { class: 'progress' }, renderVacio()));
      return;
    }

    const ahora = new Date();
    const resumen = resumenEstadisticas(reviews, ahora);
    const dias = repasosPorDia(reviews, ahora, SEMANAS);
    const dominio = calcularDominio(cards);

    const contenido = el(
      'section',
      { class: 'progress' },
      el('h1', { class: 'progress__titulo', text: 'Tu progreso' }),
      renderResumen(resumen),
      renderHeatmap(dias),
      renderDominio(dominio),
    );

    if (reviews.length === 0) {
      contenido.insertBefore(
        el('p', {
          class: 'progress__nota',
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
        el('p', { class: 'progress__cargando', text: 'Calculando tus estadísticas…' }),
      );
      const [reviews, cards] = await Promise.all([
        getAll<LogReview>('reviews'),
        getAll<TarjetaConFsrs>('cards'),
      ]);
      render(reviews, cards);
    },
  };
}
