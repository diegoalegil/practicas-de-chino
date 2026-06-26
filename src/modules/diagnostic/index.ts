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
        { class: 'diag diag--intro' },
        el('span', {
          class: 'diag__sello-hanzi',
          attrs: { 'aria-hidden': 'true' },
          text: '校',
        }),
        el('h1', { class: 'diag__titulo', text: 'Calibremos tu chino' }),
        el('p', {
          class: 'diag__texto',
          text: 'Esto no es un examen. Es una breve calibración para ver dónde está tu reconocimiento ahora mismo y despertar lo que ya llevas dentro.',
        }),
        el('p', {
          class: 'diag__texto diag__texto--suave',
          text: 'Unas doce preguntas de hanzi a significado. Responde a tu ritmo, sin prisa.',
        }),
        el('button', {
          class: 'btn btn--tinta diag__cta',
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

    const opciones = el(
      'div',
      { class: 'diag__opciones' },
      ...item.opciones.map((opcion) => {
        const esCorrecta = opcion === item.correcta;
        let clase = 'diag__opcion';
        if (enFeedback) {
          if (esCorrecta) {
            clase += ' is-correcta';
          } else if (!ultimaCorrecta) {
            clase += ' is-incorrecta';
          } else {
            clase += ' is-atenuada';
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
          { class: `diag__feedback ${ultimaCorrecta ? 'is-bien' : 'is-mal'}` },
          el('span', {
            class: 'diag__feedback-icono',
            attrs: { 'aria-hidden': 'true' },
            text: ultimaCorrecta ? '✓' : '·',
          }),
          el('span', {
            class: 'diag__feedback-texto',
            text: ultimaCorrecta
              ? 'Lo reconoces. Seguimos.'
              : `Es «${item.correcta}». Lo guardamos para repasarlo.`,
          }),
          el('button', {
            class: 'btn btn--tinta diag__siguiente',
            text: 'Siguiente',
            attrs: { type: 'button' },
            on: {
              click: () => {
                avanzar();
              },
            },
          }),
        )
      : el('p', { class: 'diag__pista', text: '¿Qué significa?' });

    root.replaceChildren(
      el(
        'section',
        { class: 'diag diag--item' },
        el('p', {
          class: 'diag__contador',
          text: `Calibrando · ${String(numero)}`,
        }),
        el(
          'div',
          { class: 'diag__tarjeta' },
          el('span', { class: 'diag__hanzi', text: item.hanzi }),
          el('span', { class: 'diag__pinyin', text: enFeedback ? item.pinyin : '' }),
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
        { class: 'diag diag--cargando' },
        el('p', { class: 'diag__texto', text: 'Sellando tu calibración…' }),
      ),
    );
  }

  function renderFin(): void {
    if (!resumen) {
      return;
    }
    const r = resumen;
    root.replaceChildren(
      el(
        'section',
        { class: 'diag diag--fin' },
        el(
          'article',
          { class: 'carta-calibracion' },
          el('span', {
            class: 'carta-calibracion__sello',
            attrs: { 'aria-hidden': 'true' },
            text: '校',
          }),
          el('p', { class: 'carta-calibracion__epigrafe', text: 'Carta de calibración' }),
          el(
            'p',
            { class: 'carta-calibracion__nivel' },
            el('span', { class: 'carta-calibracion__nivel-etq', text: 'Tu chino vive en torno a' }),
            el('span', {
              class: 'carta-calibracion__nivel-val',
              text: `HSK ${String(r.nivelHsk)}`,
            }),
          ),
          el('p', {
            class: 'carta-calibracion__cuerpo',
            text: 'Reconoces mucho más de lo que crees. La base está intacta; solo hay que despertar tu producción y sacarle brillo al óxido.',
          }),
          el(
            'dl',
            { class: 'carta-calibracion__datos' },
            el(
              'div',
              { class: 'carta-calibracion__dato' },
              el('dt', { text: 'Reconocidas' }),
              el('dd', { text: `${String(r.aciertos)} / ${String(r.totalItems)}` }),
            ),
            el(
              'div',
              { class: 'carta-calibracion__dato' },
              el('dt', { text: 'Reactivadas' }),
              el('dd', { text: String(reactivadas) }),
            ),
          ),
          el('p', {
            class: 'carta-calibracion__nota',
            text:
              reactivadas > 0
                ? `Ya sembramos ${String(reactivadas)} palabras en tu memoria con ventaja, listas para volver cuando toque.`
                : 'Cuando empieces, iremos construyendo tu memoria palabra a palabra.',
          }),
        ),
        el('a', {
          class: 'btn btn--tinta diag__cta',
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
