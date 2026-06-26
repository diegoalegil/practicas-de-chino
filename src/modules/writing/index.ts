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

/** Construye el marco 田字格 (líneas guía) como SVG nativo. */
function crearGuias(): SVGSVGElement {
  const svg = document.createElementNS(SVG_NS, 'svg');
  svg.setAttribute('class', 'writing__guias');
  svg.setAttribute('viewBox', '0 0 100 100');
  svg.setAttribute('preserveAspectRatio', 'none');
  svg.setAttribute('aria-hidden', 'true');

  const linea = (x1: number, y1: number, x2: number, y2: number): SVGLineElement => {
    const l = document.createElementNS(SVG_NS, 'line');
    l.setAttribute('x1', String(x1));
    l.setAttribute('y1', String(y1));
    l.setAttribute('x2', String(x2));
    l.setAttribute('y2', String(y2));
    l.setAttribute('stroke', 'var(--color-linea)');
    l.setAttribute('stroke-width', '0.6');
    l.setAttribute('stroke-dasharray', '3 3');
    return l;
  };

  svg.append(
    linea(50, 0, 50, 100), // vertical central
    linea(0, 50, 100, 50), // horizontal central
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
        { class: 'writing__item' },
        el(
          'button',
          {
            class: `writing__celda${estaPracticado(estado, indice) ? ' is-practicado' : ''}`,
            attrs: { type: 'button', 'aria-label': `Practicar ${c.hanzi} (${c.pinyin})` },
            on: {
              click: () => {
                estado = seleccionar(estado, indice);
                render();
              },
            },
          },
          el('span', { class: 'writing__celda-hanzi', text: c.hanzi }),
          el('span', { class: 'writing__celda-pinyin', text: c.pinyin }),
          ...(estaPracticado(estado, indice)
            ? [
                el('span', {
                  class: 'writing__celda-check',
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
        { class: 'writing' },
        el('h1', { class: 'writing__titulo', text: 'Escritura de hanzi' }),
        el('p', {
          class: 'writing__intro',
          text: 'Elige un carácter para ver el orden de los trazos y practicar a mano.',
        }),
        el('ul', { class: 'writing__lista' }, ...items),
      ),
    );
  }

  function renderPanel(host: HTMLElement): void {
    const caracter = caracterSeleccionado(estado);
    if (!caracter) {
      renderLista(host);
      return;
    }

    const marco = el('div', { class: 'writing__marco' });
    const guias = crearGuias();
    const lienzo = el('div', { class: 'writing__lienzo' });
    marco.append(guias, lienzo);

    const estadoTexto = el('p', {
      class: 'writing__estado',
      attrs: { role: 'status', 'aria-live': 'polite' },
      text: 'Pulsa «Ver trazos» o «Practicar».',
    });

    const fijarEstado = (mensaje: string, variante?: 'error' | 'ok'): void => {
      estadoTexto.textContent = mensaje;
      estadoTexto.className = `writing__estado${variante ? ` is-${variante}` : ''}`;
    };

    const btnVer = el('button', {
      class: 'writing__btn writing__btn--ver',
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
      class: 'writing__btn writing__btn--practicar',
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
      class: 'writing__btn writing__btn--siguiente',
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
        { class: 'writing writing__panel' },
        el(
          'div',
          { class: 'writing__cabecera' },
          el('button', {
            class: 'writing__volver',
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
            { class: 'writing__info' },
            el('span', { class: 'writing__info-pinyin', text: caracter.pinyin }),
            el('span', { class: 'writing__info-es', text: caracter.es }),
          ),
        ),
        marco,
        estadoTexto,
        el('div', { class: 'writing__acciones' }, btnVer, btnPracticar, btnSiguiente),
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
        strokeColor: 'var(--color-tinta)',
        outlineColor: 'var(--color-linea)',
        highlightColor: 'var(--color-jade)',
        drawingColor: 'var(--color-sello)',
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
