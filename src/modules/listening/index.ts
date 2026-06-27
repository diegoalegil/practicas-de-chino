import type { LexemaSemilla, View } from '../../types';
import { el } from '../../ui/dom';
import { hablar, hayVozChina, vozDisponible } from '../../core/audio';
import { LEXEMAS } from '../../content';
import './listening.css';
import {
  BANCO_TONOS,
  descripcionTono,
  generarOpciones,
  lexemasParaDictado,
  pathTono,
  pinyinCoincide,
  tonoCorrecto,
  type SilabaTono,
  type Tono,
} from './listening.logic';

type Ejercicio = 'menu' | 'dictado' | 'tonos' | 'opcion';
type Veredicto = 'pendiente' | 'acierto' | 'fallo';

const SVG_NS = 'http://www.w3.org/2000/svg';
const TONOS: readonly Tono[] = [1, 2, 3, 4];

interface EstadoVista {
  ejercicio: Ejercicio;
  lexema: LexemaSemilla | undefined;
  silaba: SilabaTono | undefined;
  opciones: LexemaSemilla[];
  respuesta: string;
  veredicto: Veredicto;
  semilla: number;
}

/** Detiene cualquier síntesis de voz en curso (al desmontar o navegar). */
function pararVoz(): void {
  if (vozDisponible()) {
    speechSynthesis.cancel();
  }
}

/** Crea un nodo SVG del contorno de un tono, con estética tinta. */
function svgContornoTono(tono: Tono, activo: boolean): SVGSVGElement {
  const svg = document.createElementNS(SVG_NS, 'svg');
  svg.setAttribute('viewBox', '0 0 100 100');
  svg.setAttribute('class', 'escucha-tone-svg');
  svg.setAttribute('aria-hidden', 'true');

  const path = document.createElementNS(SVG_NS, 'path');
  path.setAttribute('d', pathTono(tono));
  path.setAttribute(
    'class',
    activo ? 'escucha-tone-svg__curva is-activa' : 'escucha-tone-svg__curva',
  );
  path.setAttribute('fill', 'none');
  svg.appendChild(path);

  return svg;
}

/** Crea el SVG grande del contorno del tono correcto (animado al revelarse). */
function svgBigtone(tono: Tono): SVGSVGElement {
  const svg = document.createElementNS(SVG_NS, 'svg');
  svg.setAttribute('viewBox', '0 0 100 100');
  svg.setAttribute('class', 'escucha-bigtone');
  svg.setAttribute('aria-hidden', 'true');

  const path = document.createElementNS(SVG_NS, 'path');
  path.setAttribute('d', pathTono(tono));
  path.setAttribute('fill', 'none');
  svg.appendChild(path);

  return svg;
}

export function createListeningView(): View {
  let root: HTMLElement;
  const dictadoBanco = lexemasParaDictado([...LEXEMAS]);
  const tonoBanco = [...BANCO_TONOS];

  let estado: EstadoVista = {
    ejercicio: 'menu',
    lexema: undefined,
    silaba: undefined,
    opciones: [],
    respuesta: '',
    veredicto: 'pendiente',
    semilla: Date.now(),
  };

  function elegirLexema(): LexemaSemilla | undefined {
    if (dictadoBanco.length === 0) {
      return undefined;
    }
    const idx = Math.floor(Math.random() * dictadoBanco.length);
    return dictadoBanco[idx];
  }

  function elegirSilaba(): SilabaTono | undefined {
    if (tonoBanco.length === 0) {
      return undefined;
    }
    const idx = Math.floor(Math.random() * tonoBanco.length);
    return tonoBanco[idx];
  }

  function nuevoDictado(): void {
    const lexema = elegirLexema();
    const opciones = lexema ? generarOpciones(lexema, dictadoBanco, 4, estado.semilla) : [];
    estado = {
      ...estado,
      ejercicio: 'dictado',
      lexema,
      opciones,
      respuesta: '',
      veredicto: 'pendiente',
      semilla: estado.semilla + 1,
    };
    reproducir();
  }

  function nuevoTono(): void {
    const silaba = elegirSilaba();
    estado = {
      ...estado,
      ejercicio: 'tonos',
      silaba,
      opciones: [],
      respuesta: '',
      veredicto: 'pendiente',
      semilla: estado.semilla + 1,
    };
    reproducir();
  }

  function nuevaOpcion(): void {
    const lexema = elegirLexema();
    const opciones = lexema ? generarOpciones(lexema, dictadoBanco, 4, estado.semilla) : [];
    estado = {
      ...estado,
      ejercicio: 'opcion',
      lexema,
      opciones,
      respuesta: '',
      veredicto: 'pendiente',
      semilla: estado.semilla + 1,
    };
    reproducir();
  }

  function reproducir(): void {
    if (estado.ejercicio === 'tonos' && estado.silaba) {
      hablar(estado.silaba.hanzi);
    } else if (estado.lexema) {
      hablar(estado.lexema.hanzi);
    }
  }

  function volverAlMenu(): void {
    pararVoz();
    estado = {
      ...estado,
      ejercicio: 'menu',
      veredicto: 'pendiente',
      respuesta: '',
    };
    render();
  }

  /** Selector segmentado de ejercicio (estética .seg del diseño). */
  function selector(): HTMLElement {
    const items: ReadonlyArray<{ clave: Ejercicio; etiqueta: string; iniciar: () => void }> = [
      { clave: 'dictado', etiqueta: 'Dictado', iniciar: nuevoDictado },
      { clave: 'tonos', etiqueta: 'Tonos', iniciar: nuevoTono },
      { clave: 'opcion', etiqueta: 'Audio › 字', iniciar: nuevaOpcion },
    ];
    return el(
      'div',
      { class: 'escucha-seg', attrs: { role: 'tablist' } },
      ...items.map((it) =>
        el('button', {
          class: estado.ejercicio === it.clave ? 'escucha-seg__btn is-on' : 'escucha-seg__btn',
          text: it.etiqueta,
          attrs: {
            type: 'button',
            role: 'tab',
            'aria-selected': estado.ejercicio === it.clave ? 'true' : 'false',
          },
          on: {
            click: () => {
              it.iniciar();
              render();
            },
          },
        }),
      ),
    );
  }

  function botonRepetir(): HTMLElement {
    return el(
      'button',
      {
        class: 'escucha-play',
        attrs: { type: 'button', 'aria-label': 'Reproducir de nuevo' },
        on: {
          click: () => {
            reproducir();
          },
        },
      },
      el('span', { class: 'escucha-play__icono', attrs: { 'aria-hidden': 'true' }, text: '🔊' }),
      el('span', { text: 'Escuchar de nuevo' }),
    );
  }

  function avisoVoz(): HTMLElement | null {
    if (hayVozChina()) {
      return null;
    }
    return el(
      'div',
      { class: 'escucha-aviso', attrs: { role: 'note' } },
      el('p', {
        class: 'escucha-aviso__titulo',
        text: 'No se detecta una voz china en este dispositivo',
      }),
      el('p', {
        class: 'escucha-aviso__texto',
        text: 'Puedes seguir practicando, pero para oír el audio instala una voz: Ajustes de iOS › Accesibilidad › Contenido hablado › Voces › Chino.',
      }),
    );
  }

  function encabezado(titulo: string): HTMLElement {
    return el(
      'header',
      { class: 'escucha-cabecera' },
      el('button', {
        class: 'escucha-volver',
        text: '‹ Ejercicios',
        attrs: { type: 'button' },
        on: {
          click: () => {
            volverAlMenu();
          },
        },
      }),
      el('h2', { class: 'escucha-titulo', text: titulo }),
    );
  }

  function tarjetaMenu(
    titulo: string,
    descripcion: string,
    glifo: string,
    onClick: () => void,
  ): HTMLElement {
    return el(
      'button',
      {
        class: 'escucha-card',
        attrs: { type: 'button' },
        on: { click: onClick },
      },
      el('span', { class: 'escucha-card__glifo', attrs: { 'aria-hidden': 'true' }, text: glifo }),
      el(
        'span',
        { class: 'escucha-card__cuerpo' },
        el('span', { class: 'escucha-card__titulo', text: titulo }),
        el('span', { class: 'escucha-card__desc', text: descripcion }),
      ),
    );
  }

  function bandaVeredicto(correcto: string, glosa: string, contorno?: Tono): HTMLElement {
    const ok = estado.veredicto === 'acierto';
    const hijos: HTMLElement[] = [
      el('p', {
        class: 'escucha-veredicto__marca',
        attrs: { 'aria-hidden': 'true' },
        text: ok ? '✓' : '✕',
      }),
      el('p', {
        class: 'escucha-veredicto__texto',
        text: ok ? '¡Correcto!' : 'Casi. La respuesta era:',
      }),
      el('p', { class: 'escucha-veredicto__hanzi', attrs: { lang: 'zh' }, text: correcto }),
      el('p', { class: 'escucha-veredicto__glosa', text: glosa }),
    ];
    const banda = el(
      'div',
      { class: `escucha-veredicto ${ok ? 'is-ok' : 'is-mal'}`, attrs: { role: 'status' } },
      ...hijos,
    );
    if (contorno !== undefined) {
      banda.appendChild(svgBigtone(contorno));
    }
    return banda;
  }

  function botonSiguiente(onNext: () => void): HTMLElement {
    return el('button', {
      class: 'escucha-btn escucha-btn--primary escucha-siguiente',
      text: 'Siguiente',
      attrs: { type: 'button' },
      on: {
        click: () => {
          onNext();
          render();
        },
      },
    });
  }

  function renderMenu(): void {
    const aviso = avisoVoz();
    const tarjetas: HTMLElement[] = [
      tarjetaMenu('Dictado', 'Escucha y escribe el pinyin o elige el carácter.', '听', () => {
        nuevoDictado();
        render();
      }),
      tarjetaMenu('Tonos', 'Identifica el tono de la sílaba que oyes.', '声', () => {
        nuevoTono();
        render();
      }),
      tarjetaMenu('Audio › Hanzi', 'Escucha y elige el carácter correcto.', '字', () => {
        nuevaOpcion();
        render();
      }),
    ];
    root.replaceChildren(
      el(
        'section',
        { class: 'escucha escucha-scr' },
        el(
          'div',
          { class: 'escucha-sec-h' },
          el('p', { class: 'escucha-sec-t', text: 'Escucha y dictado' }),
          el('span', { class: 'escucha-brush', attrs: { 'aria-hidden': 'true' } }),
        ),
        selector(),
        ...(aviso ? [aviso] : []),
        el('div', { class: 'escucha-menu' }, ...tarjetas),
      ),
    );
  }

  function renderDictado(): void {
    const lexema = estado.lexema;
    if (!lexema) {
      renderMenu();
      return;
    }
    const resuelto = estado.veredicto !== 'pendiente';

    const formInput = el('input', {
      class: 'escucha-dict-in',
      attrs: {
        type: 'text',
        inputmode: 'latin',
        autocapitalize: 'none',
        autocomplete: 'off',
        spellcheck: 'false',
        placeholder: 'pinyin (sin tonos)',
        'aria-label': 'Escribe el pinyin',
      },
    });
    if (resuelto) {
      formInput.value = estado.respuesta;
      formInput.disabled = true;
    }

    const pinyinCorrecto = lexema.pinyin;
    function comprobarTexto(): void {
      const valor = formInput.value;
      const ok = pinyinCoincide(valor, pinyinCorrecto);
      estado = { ...estado, respuesta: valor, veredicto: ok ? 'acierto' : 'fallo' };
      render();
    }

    const form = el(
      'form',
      {
        class: 'escucha-form',
        on: {
          submit: (event) => {
            event.preventDefault();
            if (estado.veredicto === 'pendiente') {
              comprobarTexto();
            }
          },
        },
      },
      formInput,
      el('button', {
        class: 'escucha-btn escucha-btn--primary escucha-btn--block',
        text: 'Comprobar',
        attrs: { type: 'submit' },
      }),
    );

    const opcionesGrid = el(
      'div',
      { class: 'escucha-opciones' },
      ...estado.opciones.map((op) => {
        const esCorrecta = op.id === lexema.id;
        const clases = ['escucha-diag-opt', 'escucha-opt-hanzi'];
        if (resuelto && esCorrecta) {
          clases.push('is-right');
        }
        return el('button', {
          class: clases.join(' '),
          text: op.hanzi,
          attrs: {
            type: 'button',
            lang: 'zh',
            ...(resuelto ? { disabled: 'true' } : {}),
          },
          on: {
            click: () => {
              if (estado.veredicto !== 'pendiente') {
                return;
              }
              estado = {
                ...estado,
                respuesta: op.hanzi,
                veredicto: esCorrecta ? 'acierto' : 'fallo',
              };
              render();
            },
          },
        });
      }),
    );

    const cuerpo: HTMLElement[] = [
      encabezado('Dictado'),
      selector(),
      el('p', {
        class: 'escucha-instruccion',
        text: 'Escucha la palabra y escribe su pinyin, o elige el carácter.',
      }),
      botonRepetir(),
    ];

    if (!resuelto) {
      cuerpo.push(
        form,
        el('p', { class: 'escucha-separador', text: 'o elige el carácter' }),
        opcionesGrid,
      );
    } else {
      cuerpo.push(
        bandaVeredicto(lexema.hanzi, `${lexema.pinyin} · ${lexema.es}`),
        opcionesGrid,
        botonSiguiente(nuevoDictado),
      );
    }

    root.replaceChildren(el('section', { class: 'escucha escucha-scr' }, ...cuerpo));
    if (!resuelto) {
      formInput.focus();
    }
  }

  function renderTonos(): void {
    const silaba = estado.silaba;
    if (!silaba) {
      renderMenu();
      return;
    }
    const resuelto = estado.veredicto !== 'pendiente';

    const botones = el(
      'div',
      { class: 'escucha-tone-grid' },
      ...TONOS.map((tono) => {
        const esCorrecto = tono === silaba.tono;
        const clases = ['escucha-tone-opt'];
        if (resuelto) {
          if (esCorrecto) {
            clases.push('is-right');
          } else if (estado.respuesta === String(tono)) {
            clases.push('is-wrong');
          }
        }
        return el(
          'button',
          {
            class: clases.join(' '),
            attrs: {
              type: 'button',
              'aria-label': `Tono ${String(tono)}: ${descripcionTono(tono)}`,
              ...(resuelto ? { disabled: 'true' } : {}),
            },
            on: {
              click: () => {
                if (estado.veredicto !== 'pendiente') {
                  return;
                }
                const ok = tonoCorrecto(tono, silaba.tono);
                estado = {
                  ...estado,
                  respuesta: String(tono),
                  veredicto: ok ? 'acierto' : 'fallo',
                };
                render();
              },
            },
          },
          svgContornoTono(tono, resuelto && esCorrecto),
          el('span', { class: 'escucha-tone-num', text: String(tono) }),
        );
      }),
    );

    const cuerpo: HTMLElement[] = [
      encabezado('Tonos'),
      selector(),
      el('p', { class: 'escucha-instruccion', text: 'Escucha la sílaba e identifica su tono.' }),
      botonRepetir(),
      botones,
    ];

    if (resuelto) {
      cuerpo.push(
        bandaVeredicto(
          silaba.hanzi,
          `${silaba.pinyin} (tono ${String(silaba.tono)}) · ${silaba.es}`,
          silaba.tono,
        ),
        botonSiguiente(nuevoTono),
      );
    }

    root.replaceChildren(el('section', { class: 'escucha escucha-scr' }, ...cuerpo));
  }

  function renderOpcion(): void {
    const lexema = estado.lexema;
    if (!lexema) {
      renderMenu();
      return;
    }
    const resuelto = estado.veredicto !== 'pendiente';

    const grid = el(
      'div',
      { class: 'escucha-opciones escucha-opciones--grande' },
      ...estado.opciones.map((op) => {
        const esCorrecta = op.id === lexema.id;
        const clases = ['escucha-diag-opt', 'escucha-opt-hanzi'];
        if (resuelto) {
          if (esCorrecta) {
            clases.push('is-right');
          } else if (estado.respuesta === op.id) {
            clases.push('is-wrong');
          }
        }
        return el('button', {
          class: clases.join(' '),
          text: op.hanzi,
          attrs: {
            type: 'button',
            lang: 'zh',
            ...(resuelto ? { disabled: 'true' } : {}),
          },
          on: {
            click: () => {
              if (estado.veredicto !== 'pendiente') {
                return;
              }
              estado = {
                ...estado,
                respuesta: op.id,
                veredicto: esCorrecta ? 'acierto' : 'fallo',
              };
              render();
            },
          },
        });
      }),
    );

    const cuerpo: HTMLElement[] = [
      encabezado('Audio › Hanzi'),
      selector(),
      el('p', { class: 'escucha-instruccion', text: 'Escucha y elige el carácter correcto.' }),
      botonRepetir(),
      grid,
    ];

    if (resuelto) {
      cuerpo.push(
        bandaVeredicto(lexema.hanzi, `${lexema.pinyin} · ${lexema.es}`),
        botonSiguiente(nuevaOpcion),
      );
    }

    root.replaceChildren(el('section', { class: 'escucha escucha-scr' }, ...cuerpo));
  }

  function render(): void {
    switch (estado.ejercicio) {
      case 'menu':
        renderMenu();
        return;
      case 'dictado':
        renderDictado();
        return;
      case 'tonos':
        renderTonos();
        return;
      case 'opcion':
        renderOpcion();
        return;
    }
  }

  return {
    mount(target) {
      root = target;
      render();
    },
    unmount() {
      pararVoz();
    },
  };
}
