import type { View } from '../../types';
import { el } from '../../ui/dom';
import { LEXEMAS } from '../../content';
import './diagnostic.css';
import {
  construirBanco,
  crearEstadoDiagnostico,
  estaCompleto,
  resumir,
  responderItem,
  siguienteItem,
  MAX_ITEMS,
  type EstadoDiagnostico,
  type ItemDiagnostico,
  type ResumenDiagnostico,
} from './diagnostic.logic';
import { sembrarReactivacion } from './reactivacion';
import { construirResultado, guardarResultado } from './resultado';

type Fase = 'intro' | 'item' | 'feedback' | 'guardando' | 'fin';

const RUTA_VOCAB = '#/vocabulario';

export function createDiagnosticView(): View {
  let root: HTMLElement;
  let estado: EstadoDiagnostico;
  let fase: Fase = 'intro';
  let itemActual: ItemDiagnostico | undefined;
  let mostradoEn = 0;
  let ultimaCorrecta = false;
  let resumen: ResumenDiagnostico | undefined;
  let reactivadas = 0;

  function avanzar(): void {
    if (estaCompleto(estado)) {
      void finalizar();
      return;
    }
    itemActual = siguienteItem(estado);
    if (!itemActual) {
      void finalizar();
      return;
    }
    fase = 'item';
    mostradoEn = Date.now();
    render();
  }

  async function finalizar(): Promise<void> {
    fase = 'guardando';
    render();
    const ahora = new Date();
    resumen = resumir(estado);
    reactivadas = await sembrarReactivacion(estado.respuestas, ahora);
    await guardarResultado(construirResultado(resumen, reactivadas, ahora));
    fase = 'fin';
    render();
  }

  function elegir(opcion: string): void {
    if (fase !== 'item' || !itemActual) {
      return;
    }
    const latencia = Date.now() - mostradoEn;
    ultimaCorrecta = opcion === itemActual.correcta;
    estado = responderItem(estado, ultimaCorrecta, latencia);
    fase = 'feedback';
    render();
  }

  function renderIntro(): void {
    root.replaceChildren(
      el(
        'section',
        { class: 'diag-view diag-intro' },
        el('span', {
          class: 'diag-sello',
          attrs: { 'aria-hidden': 'true' },
          text: '校',
        }),
        el('h1', { class: 'diag-titulo', text: 'Calibremos tu chino' }),
        el('span', { class: 'diag-brush', attrs: { 'aria-hidden': 'true' } }),
        el('p', {
          class: 'diag-texto',
          text: 'Esto no es un examen. Es una breve calibración para ver dónde está tu reconocimiento ahora mismo y despertar lo que ya llevas dentro.',
        }),
        el('p', {
          class: 'diag-texto diag-suave',
          text: 'Unas doce preguntas de hanzi a significado. Responde a tu ritmo, sin prisa.',
        }),
        el('button', {
          class: 'diag-btn diag-btn-primary diag-cta',
          text: 'Comenzar calibración',
          attrs: { type: 'button' },
          on: {
            click: () => {
              avanzar();
            },
          },
        }),
      ),
    );
  }

  function renderItem(): void {
    if (!itemActual) {
      return;
    }
    const item = itemActual;
    const numero = estado.respuestas.length + 1;
    const enFeedback = fase === 'feedback';
    const pct = Math.min(100, Math.round((numero / MAX_ITEMS) * 100));

    const opciones = el(
      'div',
      { class: 'diag-opciones' },
      ...item.opciones.map((opcion) => {
        const esCorrecta = opcion === item.correcta;
        let clase = 'diag-opt';
        if (enFeedback) {
          if (esCorrecta) {
            clase += ' diag-right';
          } else if (!ultimaCorrecta) {
            clase += ' diag-wrong';
          } else {
            clase += ' diag-dim';
          }
        }
        return el('button', {
          class: clase,
          text: opcion,
          attrs: enFeedback ? { type: 'button', disabled: 'true' } : { type: 'button' },
          on: {
            click: () => {
              elegir(opcion);
            },
          },
        });
      }),
    );

    const feedback = enFeedback
      ? el(
          'div',
          { class: `diag-feedback ${ultimaCorrecta ? 'diag-bien' : 'diag-mal'}` },
          el('span', {
            class: 'diag-feedback-icono',
            attrs: { 'aria-hidden': 'true' },
            text: ultimaCorrecta ? '✓' : '·',
          }),
          el('span', {
            class: 'diag-feedback-texto',
            text: ultimaCorrecta
              ? 'Lo reconoces. Seguimos.'
              : `Es «${item.correcta}». Lo guardamos para repasarlo.`,
          }),
          el('button', {
            class: 'diag-btn diag-btn-primary diag-btn-sm diag-siguiente',
            text: 'Siguiente',
            attrs: { type: 'button' },
            on: {
              click: () => {
                avanzar();
              },
            },
          }),
        )
      : el('p', { class: 'diag-pista', text: '¿Qué significa?' });

    root.replaceChildren(
      el(
        'section',
        { class: 'diag-view diag-item' },
        el(
          'div',
          { class: 'diag-progreso' },
          el('p', {
            class: 'diag-contador',
            text: `Calibrando · ${String(numero)}`,
          }),
          el(
            'div',
            { class: 'diag-pbar', attrs: { 'aria-hidden': 'true' } },
            el('i', { attrs: { style: `width:${String(pct)}%` } }),
          ),
        ),
        el(
          'div',
          { class: 'diag-card' },
          el('span', {
            class: 'diag-card-wm',
            attrs: { 'aria-hidden': 'true' },
            text: item.hanzi,
          }),
          el('span', { class: 'diag-q-hanzi', text: item.hanzi }),
          el('span', { class: 'diag-pinyin', text: enFeedback ? item.pinyin : '' }),
        ),
        opciones,
        feedback,
      ),
    );
  }

  function renderGuardando(): void {
    root.replaceChildren(
      el(
        'section',
        { class: 'diag-view diag-cargando' },
        el('span', {
          class: 'diag-cargando-sello',
          attrs: { 'aria-hidden': 'true' },
          text: '校',
        }),
        el('p', { class: 'diag-texto', text: 'Sellando tu calibración…' }),
      ),
    );
  }

  function radarSvg(r: ResumenDiagnostico): HTMLElement {
    // Radar de 4 ejes derivado del resumen (reconocimiento, precision, agilidad,
    // alcance). Solo visualizacion; no altera ninguna metrica.
    const cx = 102;
    const cy = 102;
    const radio = 74;
    const ejes = [
      { etq: 'Reconoce', v: r.totalItems > 0 ? r.aciertos / r.totalItems : 0 },
      { etq: 'Precisión', v: r.porcentaje / 100 },
      {
        etq: 'Agilidad',
        v: r.latenciaMediaMs > 0 ? Math.max(0.15, Math.min(1, 4000 / r.latenciaMediaMs)) : 0.5,
      },
      { etq: 'Alcance', v: Math.min(1, r.nivelHsk / 6) },
    ];
    const n = ejes.length;
    const punto = (i: number, escala: number): [number, number] => {
      const ang = -Math.PI / 2 + (i / n) * Math.PI * 2;
      return [cx + Math.cos(ang) * radio * escala, cy + Math.sin(ang) * radio * escala];
    };
    const fmt = (p: [number, number]): string => `${p[0].toFixed(1)},${p[1].toFixed(1)}`;

    const anillos = [0.34, 0.67, 1]
      .map((escala) => {
        const pts = ejes.map((_eje, i) => fmt(punto(i, escala))).join(' ');
        return `<polygon class="diag-radar-grid" points="${pts}"></polygon>`;
      })
      .join('');

    const ejesSvg = ejes
      .map((_eje, i) => {
        const [x, y] = punto(i, 1);
        return `<line class="diag-radar-axis" x1="${String(cx)}" y1="${String(cy)}" x2="${x.toFixed(1)}" y2="${y.toFixed(1)}"></line>`;
      })
      .join('');

    const areaPts = ejes
      .map((eje, i) => fmt(punto(i, Math.max(0.08, Math.min(1, eje.v)))))
      .join(' ');

    const dots = ejes
      .map((eje, i) => {
        const [x, y] = punto(i, Math.max(0.08, Math.min(1, eje.v)));
        return `<circle class="diag-radar-dot" cx="${x.toFixed(1)}" cy="${y.toFixed(1)}" r="3"></circle>`;
      })
      .join('');

    const etiquetas = ejes
      .map((eje, i) => {
        const [x, y] = punto(i, 1.22);
        const anchor = Math.abs(x - cx) < 8 ? 'middle' : x > cx ? 'start' : 'end';
        return `<text x="${x.toFixed(1)}" y="${(y + 4).toFixed(1)}" text-anchor="${anchor}">${eje.etq}</text>`;
      })
      .join('');

    const svg = `<svg class="diag-radar" viewBox="0 0 204 204" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">${anillos}${ejesSvg}<polygon class="diag-radar-area" points="${areaPts}"></polygon>${dots}${etiquetas}</svg>`;
    return el('div', { class: 'diag-radar-wrap', html: svg });
  }

  function renderFin(): void {
    if (!resumen) {
      return;
    }
    const r = resumen;
    root.replaceChildren(
      el(
        'section',
        { class: 'diag-view diag-fin' },
        el(
          'article',
          { class: 'diag-carta' },
          el('span', {
            class: 'diag-carta-wm',
            attrs: { 'aria-hidden': 'true' },
            text: '校',
          }),
          el('span', {
            class: 'diag-carta-sello',
            attrs: { 'aria-hidden': 'true' },
            text: '校',
          }),
          el('p', { class: 'diag-carta-epigrafe', text: 'Carta de calibración' }),
          el(
            'p',
            { class: 'diag-carta-nivel' },
            el('span', { class: 'diag-carta-nivel-etq', text: 'Tu chino vive en torno a' }),
            el('span', {
              class: 'diag-carta-nivel-val',
              text: `HSK ${String(r.nivelHsk)}`,
            }),
          ),
          radarSvg(r),
          el('p', {
            class: 'diag-carta-cuerpo',
            text: 'Reconoces mucho más de lo que crees. La base está intacta; solo hay que despertar tu producción y sacarle brillo al óxido.',
          }),
          el(
            'dl',
            { class: 'diag-carta-datos' },
            el(
              'div',
              { class: 'diag-carta-dato' },
              el('dt', { text: 'Reconocidas' }),
              el('dd', { text: `${String(r.aciertos)} / ${String(r.totalItems)}` }),
            ),
            el(
              'div',
              { class: 'diag-carta-dato' },
              el('dt', { text: 'Reactivadas' }),
              el('dd', { text: String(reactivadas) }),
            ),
          ),
          el('p', {
            class: 'diag-carta-nota',
            text:
              reactivadas > 0
                ? `Ya sembramos ${String(reactivadas)} palabras en tu memoria con ventaja, listas para volver cuando toque.`
                : 'Cuando empieces, iremos construyendo tu memoria palabra a palabra.',
          }),
        ),
        el('a', {
          class: 'diag-btn diag-btn-primary diag-cta',
          attrs: { href: RUTA_VOCAB },
          text: 'Empezar reactivación',
        }),
      ),
    );
  }

  function render(): void {
    switch (fase) {
      case 'intro':
        renderIntro();
        return;
      case 'item':
      case 'feedback':
        renderItem();
        return;
      case 'guardando':
        renderGuardando();
        return;
      case 'fin':
        renderFin();
        return;
    }
  }

  return {
    mount(target) {
      root = target;
      const banco = construirBanco(LEXEMAS, Date.now());
      estado = crearEstadoDiagnostico(banco);
      fase = 'intro';
      render();
    },
  };
}
