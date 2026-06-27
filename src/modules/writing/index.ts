import HanziWriter, { type HanziWriterInstance, type QuizSummary } from 'hanzi-writer';
import type { View } from '../../types';
import { el } from '../../ui/dom';
import './writing.css';
import { CARACTERES } from './lessons';
import {
  avanzar,
  caracterSeleccionado,
  deseleccionar,
  estaPracticado,
  iniciarEscritura,
  marcarPracticado,
  seleccionar,
  type EstadoEscritura,
} from './writing.logic';

const SVG_NS = 'http://www.w3.org/2000/svg';

/** Construye las diagonales 田字格 (líneas guía) como SVG nativo (oro punteado). */
function crearGuias(): SVGSVGElement {
  const svg = document.createElementNS(SVG_NS, 'svg');
  svg.setAttribute('class', 'escr__guias');
  svg.setAttribute('viewBox', '0 0 100 100');
  svg.setAttribute('preserveAspectRatio', 'none');
  svg.setAttribute('aria-hidden', 'true');

  const linea = (x1: number, y1: number, x2: number, y2: number): SVGLineElement => {
    const l = document.createElementNS(SVG_NS, 'line');
    l.setAttribute('x1', String(x1));
    l.setAttribute('y1', String(y1));
    l.setAttribute('x2', String(x2));
    l.setAttribute('y2', String(y2));
    l.setAttribute('stroke', 'var(--gold)');
    l.setAttribute('stroke-width', '0.6');
    l.setAttribute('stroke-dasharray', '3 4');
    l.setAttribute('opacity', '0.5');
    return l;
  };

  svg.append(
    linea(0, 0, 100, 100), // diagonal
    linea(100, 0, 0, 100), // diagonal
  );
  return svg;
}

export function createWritingView(): View {
  let root: HTMLElement | undefined;
  let estado: EstadoEscritura = iniciarEscritura(CARACTERES);
  let writer: HanziWriterInstance | undefined;

  function destruirWriter(): void {
    if (writer) {
      try {
        writer.cancelQuiz();
      } catch {
        // El writer puede no estar en modo quiz; lo ignoramos.
      }
      writer = undefined;
    }
  }

  function renderLista(host: HTMLElement): void {
    const items = estado.caracteres.map((c, indice) =>
      el(
        'li',
        { class: 'escr__item' },
        el(
          'button',
          {
            class: `escr__celda${estaPracticado(estado, indice) ? ' is-practicado' : ''}`,
            attrs: { type: 'button', 'aria-label': `Practicar ${c.hanzi} (${c.pinyin})` },
            on: {
              click: () => {
                estado = seleccionar(estado, indice);
                render();
              },
            },
          },
          el('span', { class: 'escr__celda-hanzi', text: c.hanzi }),
          el('span', { class: 'escr__celda-pinyin', text: c.pinyin }),
          ...(estaPracticado(estado, indice)
            ? [
                el('span', {
                  class: 'escr__celda-check',
                  attrs: { 'aria-hidden': 'true' },
                  text: '✓',
                }),
              ]
            : []),
        ),
      ),
    );

    host.replaceChildren(
      el(
        'section',
        { class: 'escr' },
        el(
          'div',
          { class: 'escr__sec-h' },
          el('h1', { class: 'escr__titulo', text: 'Escritura de hanzi' }),
          el('div', { class: 'escr__brush', attrs: { 'aria-hidden': 'true' } }),
        ),
        el('p', {
          class: 'escr__intro',
          text: 'Elige un carácter para ver el orden de los trazos y practicar a mano.',
        }),
        el('ul', { class: 'escr__lista' }, ...items),
      ),
    );
  }

  function renderPanel(host: HTMLElement): void {
    const caracter = caracterSeleccionado(estado);
    if (!caracter) {
      renderLista(host);
      return;
    }

    const marco = el('div', { class: 'escr__marco' });
    const guias = crearGuias();
    const lienzo = el('div', { class: 'escr__lienzo' });
    marco.append(guias, lienzo);

    const estadoTexto = el('p', {
      class: 'escr__estado',
      attrs: { role: 'status', 'aria-live': 'polite' },
      text: 'Pulsa «Ver trazos» o «Practicar».',
    });

    const fijarEstado = (mensaje: string, variante?: 'error' | 'ok'): void => {
      estadoTexto.textContent = mensaje;
      estadoTexto.className = `escr__estado${variante ? ` is-${variante}` : ''}`;
    };

    const btnVer = el('button', {
      class: 'escr__btn escr__btn--ver',
      text: 'Ver trazos',
      attrs: { type: 'button' },
      on: {
        click: () => {
          if (!writer) {
            return;
          }
          fijarEstado('Mostrando el orden de los trazos…');
          void writer.animateCharacter({
            onComplete: () => {
              fijarEstado('¿Listo para practicar?');
            },
          });
        },
      },
    });

    const btnPracticar = el('button', {
      class: 'escr__btn escr__btn--practicar',
      text: 'Practicar',
      attrs: { type: 'button' },
      on: {
        click: () => {
          if (!writer) {
            return;
          }
          fijarEstado('Traza el carácter con el dedo o el ratón.');
          writer.quiz({
            showHintAfterMisses: 3,
            onComplete: (resumen: QuizSummary) => {
              const sel = estado.seleccion;
              if (sel !== null) {
                estado = marcarPracticado(estado, sel);
              }
              fijarEstado(
                resumen.totalMistakes === 0
                  ? '¡Perfecto! Sin errores.'
                  : `Completado con ${String(resumen.totalMistakes)} fallo(s).`,
                'ok',
              );
            },
          });
        },
      },
    });

    const btnSiguiente = el('button', {
      class: 'escr__btn escr__btn--siguiente',
      text: 'Siguiente',
      attrs: { type: 'button' },
      on: {
        click: () => {
          estado = avanzar(estado);
          render();
        },
      },
    });

    host.replaceChildren(
      el(
        'section',
        { class: 'escr escr__panel' },
        el(
          'div',
          { class: 'escr__cabecera' },
          el('button', {
            class: 'escr__volver',
            text: '← Lista',
            attrs: { type: 'button' },
            on: {
              click: () => {
                estado = deseleccionar(estado);
                render();
              },
            },
          }),
          el(
            'div',
            { class: 'escr__info' },
            el('span', { class: 'escr__info-pinyin', text: caracter.pinyin }),
            el('span', { class: 'escr__info-es', text: caracter.es }),
          ),
        ),
        marco,
        el(
          'div',
          { class: 'escr__progreso', attrs: { 'aria-hidden': 'true' } },
          el('span', { class: 'escr__wdot on' }),
          el('span', { class: 'escr__wdot' }),
          el('span', { class: 'escr__wdot' }),
        ),
        estadoTexto,
        el('div', { class: 'escr__acciones' }, btnVer, btnPracticar, btnSiguiente),
      ),
    );

    // El contenedor ya está en el DOM y con tamaño: ahora creamos el writer.
    try {
      writer = HanziWriter.create(lienzo, caracter.hanzi, {
        width: 240,
        height: 240,
        padding: 8,
        showOutline: true,
        strokeAnimationSpeed: 1,
        delayBetweenStrokes: 200,
        strokeColor: 'var(--ink-900)',
        outlineColor: 'var(--surface-line)',
        highlightColor: 'var(--jade)',
        drawingColor: 'var(--accent)',
        onLoadCharDataError: () => {
          btnVer.disabled = true;
          btnPracticar.disabled = true;
          fijarEstado(
            'No se pudieron cargar los trazos de este carácter. Revisa tu conexión e inténtalo de nuevo.',
            'error',
          );
        },
      });
    } catch {
      btnVer.disabled = true;
      btnPracticar.disabled = true;
      fijarEstado('No se pudo iniciar la práctica de escritura en este dispositivo.', 'error');
    }
  }

  function render(): void {
    if (!root) {
      return;
    }
    destruirWriter();
    if (estado.seleccion === null) {
      renderLista(root);
    } else {
      renderPanel(root);
    }
  }

  return {
    mount(target) {
      root = target;
      estado = iniciarEscritura(CARACTERES);
      render();
    },
    unmount() {
      destruirWriter();
      root = undefined;
    },
  };
}
