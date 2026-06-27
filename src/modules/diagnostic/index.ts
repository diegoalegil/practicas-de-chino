import type { View } from '../../types';
import { el } from '../../ui/dom';
import { LEXEMAS } from '../../content';
import { TEXTOS } from '../reading/data';
import { hablar } from '../../core/audio';
import './diagnostic.css';
import {
  construirBanco,
  crearEstado,
  estaCompleto,
  resumir,
  responder,
  siguienteItem,
  HABILIDADES,
  MAX_ITEMS,
  type EstadoDiagnostico,
  type Habilidad,
  type ItemDiagnostico,
  type ResumenDiagnostico,
} from './diagnostic.logic';
import { sembrarReactivacion } from './reactivacion';
import { construirResultado, guardarResultado } from './resultado';

type Fase = 'intro' | 'item' | 'feedback' | 'guardando' | 'fin';

const RUTA_VOCAB = '#/vocabulario';

/** Etiqueta corta y cálida de cada habilidad (para progreso y radar). */
const ETIQUETA: Record<Habilidad, string> = {
  vocab: 'Vocabulario',
  lectura: 'Lectura',
  escucha: 'Escucha',
  escritura: 'Escritura',
};

/** Pista mostrada sobre las opciones según la habilidad del ítem. */
const PISTA: Record<Habilidad, string> = {
  vocab: '¿Qué significa?',
  lectura: 'Según el texto…',
  escucha: 'Escucha y elige el carácter',
  escritura: '¿Cómo se escribe?',
};

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
    estado = responder(estado, ultimaCorrecta, latencia);
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
          text: 'Esto no es un examen. Es una breve calibración para ver dónde está tu chino ahora mismo y despertar lo que ya llevas dentro.',
        }),
        el('p', {
          class: 'diag-texto diag-suave',
          text: 'Tocaremos cuatro habilidades —vocabulario, lectura, escucha y escritura— con unas pocas preguntas de cada una. Responde a tu ritmo, sin prisa.',
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

  /** Tarjeta de estímulo según la habilidad del ítem. */
  function renderEstimulo(item: ItemDiagnostico, enFeedback: boolean): HTMLElement {
    if (item.habilidad === 'escucha') {
      const audio = item.audio ?? '';
      return el(
        'div',
        { class: 'diag-card diag-card-audio' },
        el('button', {
          class: 'diag-btn diag-audio-btn',
          text: '▶ Reproducir',
          attrs: { type: 'button', 'aria-label': 'Reproducir audio' },
          on: {
            click: () => {
              // Gesto explícito del usuario: nunca autoplay.
              hablar(audio);
            },
          },
        }),
        el('span', {
          class: 'diag-pinyin',
          text: enFeedback ? `${item.correcta} · ${item.pinyin}` : '',
        }),
      );
    }

    if (item.habilidad === 'lectura') {
      const [contexto = '', enunciado = ''] = item.prompt.split('\n\n');
      return el(
        'div',
        { class: 'diag-card diag-card-lectura' },
        el('p', { class: 'diag-lectura-frase', text: contexto }),
        el('p', { class: 'diag-lectura-pregunta', text: enunciado }),
      );
    }

    if (item.habilidad === 'escritura') {
      return el(
        'div',
        { class: 'diag-card diag-card-escritura' },
        el('span', { class: 'diag-q-prompt', text: item.prompt }),
      );
    }

    // vocab
    return el(
      'div',
      { class: 'diag-card' },
      el('span', {
        class: 'diag-card-wm',
        attrs: { 'aria-hidden': 'true' },
        text: item.prompt,
      }),
      el('span', { class: 'diag-q-hanzi', text: item.prompt }),
      el('span', { class: 'diag-pinyin', text: enFeedback ? item.pinyin : '' }),
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
              : `Era «${item.correcta}». Lo guardamos para repasarlo.`,
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
      : el('p', { class: 'diag-pista', text: PISTA[item.habilidad] });

    root.replaceChildren(
      el(
        'section',
        { class: `diag-view diag-item diag-skill-${item.habilidad}` },
        el(
          'div',
          { class: 'diag-progreso' },
          el('p', {
            class: 'diag-contador',
            text: `${ETIQUETA[item.habilidad]} · ${String(numero)}`,
          }),
          el(
            'div',
            { class: 'diag-pbar', attrs: { 'aria-hidden': 'true' } },
            el('i', { attrs: { style: `width:${String(pct)}%` } }),
          ),
        ),
        renderEstimulo(item, enFeedback),
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
    // Radar de las 4 HABILIDADES: cada eje es el nivel relativo de una habilidad
    // (porcentaje de aciertos). Solo visualización; no altera ninguna métrica.
    const cx = 102;
    const cy = 102;
    const radio = 74;
    const ejes = HABILIDADES.map((h) => {
      const p = r.perfil[h];
      return { etq: ETIQUETA[h], v: p.total > 0 ? p.aciertos / p.total : 0 };
    });
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
            text: 'Cada habilidad tiene su propio pulso, y eso está bien. Reconoces mucho más de lo que crees: la base está intacta y solo hay que sacarle brillo al óxido.',
          }),
          el(
            'dl',
            { class: 'diag-carta-datos' },
            el(
              'div',
              { class: 'diag-carta-dato' },
              el('dt', { text: 'Aciertos' }),
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
      const banco = construirBanco({ lexemas: LEXEMAS, textos: TEXTOS }, Date.now());
      estado = crearEstado(banco);
      fase = 'intro';
      render();
    },
  };
}
