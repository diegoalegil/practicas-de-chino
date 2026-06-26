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
  svg.setAttribute('class', 'lis-tono__svg');
  svg.setAttribute('aria-hidden', 'true');

  const guia = document.createElementNS(SVG_NS, 'line');
  guia.setAttribute('x1', '10');
  guia.setAttribute('y1', '95');
  guia.setAttribute('x2', '90');
  guia.setAttribute('y2', '95');
  guia.setAttribute('class', 'lis-tono__guia');
  svg.appendChild(guia);

  const path = document.createElementNS(SVG_NS, 'path');
  path.setAttribute('d', pathTono(tono));
  path.setAttribute('class', activo ? 'lis-tono__curva is-activa' : 'lis-tono__curva');
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

  function botonRepetir(): HTMLElement {
    return el(
      'button',
      {
        class: 'lis-play',
        attrs: { type: 'button', 'aria-label': 'Reproducir de nuevo' },
        on: {
          click: () => {
            reproducir();
          },
        },
      },
      el('span', { class: 'lis-play__icono', attrs: { 'aria-hidden': 'true' }, text: '🔊' }),
      el('span', { text: 'Escuchar de nuevo' }),
    );
  }

  function avisoVoz(): HTMLElement | null {
    if (hayVozChina()) {
      return null;
    }
    return el(
      'div',
      { class: 'lis-aviso', attrs: { role: 'note' } },
      el('p', {
        class: 'lis-aviso__titulo',
        text: 'No se detecta una voz china en este dispositivo',
      }),
      el('p', {
        class: 'lis-aviso__texto',
        text: 'Puedes seguir practicando, pero para oír el audio instala una voz: Ajustes de iOS › Accesibilidad › Contenido hablado › Voces › Chino.',
      }),
    );
  }

  function encabezado(titulo: string): HTMLElement {
    return el(
      'header',
      { class: 'lis-cabecera' },
      el('button', {
        class: 'lis-volver',
        text: '‹ Ejercicios',
        attrs: { type: 'button' },
        on: {
          click: () => {
            volverAlMenu();
          },
        },
      }),
      el('h2', { class: 'lis-titulo', text: titulo }),
    );
  }

  function tarjetaMenu(
    titulo: string,
    descripcion: string,
    icono: string,
    onClick: () => void,
  ): HTMLElement {
    return el(
      'button',
      {
        class: 'lis-card',
        attrs: { type: 'button' },
        on: { click: onClick },
      },
      el('span', { class: 'lis-card__icono', attrs: { 'aria-hidden': 'true' }, text: icono }),
      el(
        'span',
        { class: 'lis-card__cuerpo' },
        el('span', { class: 'lis-card__titulo', text: titulo }),
        el('span', { class: 'lis-card__desc', text: descripcion }),
      ),
    );
  }

  function bandaVeredicto(correcto: string, glosa: string): HTMLElement {
    const ok = estado.veredicto === 'acierto';
    return el(
      'div',
      { class: `lis-veredicto ${ok ? 'is-ok' : 'is-mal'}`, attrs: { role: 'status' } },
      el('p', {
        class: 'lis-veredicto__marca',
        attrs: { 'aria-hidden': 'true' },
        text: ok ? '✓' : '✕',
      }),
      el('p', {
        class: 'lis-veredicto__texto',
        text: ok ? '¡Correcto!' : 'Casi. La respuesta era:',
      }),
      el('p', { class: 'lis-veredicto__hanzi', attrs: { lang: 'zh' }, text: correcto }),
      el('p', { class: 'lis-veredicto__glosa', text: glosa }),
    );
  }

  function botonSiguiente(onNext: () => void): HTMLElement {
    return el('button', {
      class: 'btn btn--tinta lis-siguiente',
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
      tarjetaMenu('Dictado', 'Escucha y escribe el pinyin o elige el carácter.', '✍️', () => {
        nuevoDictado();
        render();
      }),
      tarjetaMenu('Tonos', 'Identifica el tono de la sílaba que oyes.', '〰️', () => {
        nuevoTono();
        render();
      }),
      tarjetaMenu('Audio › Hanzi', 'Escucha y elige el carácter correcto.', '👂', () => {
        nuevaOpcion();
        render();
      }),
    ];
    root.replaceChildren(
      el(
        'section',
        { class: 'lis' },
        el('h1', { class: 'lis-portada__titulo', text: 'Escucha y dictado' }),
        ...(aviso ? [aviso] : []),
        el('div', { class: 'lis-menu' }, ...tarjetas),
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
      class: 'lis-input',
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
        class: 'lis-form',
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
        class: 'btn btn--tinta',
        text: 'Comprobar',
        attrs: { type: 'submit' },
      }),
    );

    const opcionesGrid = el(
      'div',
      { class: 'lis-opciones' },
      ...estado.opciones.map((op) => {
        const esCorrecta = op.id === lexema.id;
        const clases = ['lis-opcion'];
        if (resuelto && esCorrecta) {
          clases.push('is-correcta');
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
      el('p', {
        class: 'lis-instruccion',
        text: 'Escucha la palabra y escribe su pinyin, o elige el carácter.',
      }),
      botonRepetir(),
    ];

    if (!resuelto) {
      cuerpo.push(
        form,
        el('p', { class: 'lis-separador', text: 'o elige el carácter' }),
        opcionesGrid,
      );
    } else {
      cuerpo.push(
        bandaVeredicto(lexema.hanzi, `${lexema.pinyin} · ${lexema.es}`),
        opcionesGrid,
        botonSiguiente(nuevoDictado),
      );
    }

    root.replaceChildren(el('section', { class: 'lis' }, ...cuerpo));
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
      { class: 'lis-tonos' },
      ...TONOS.map((tono) => {
        const esCorrecto = tono === silaba.tono;
        const clases = ['lis-tono'];
        if (resuelto) {
          if (esCorrecto) {
            clases.push('is-correcta');
          } else if (estado.respuesta === String(tono)) {
            clases.push('is-fallo');
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
          el('span', { class: 'lis-tono__num', text: String(tono) }),
        );
      }),
    );

    const cuerpo: HTMLElement[] = [
      encabezado('Tonos'),
      el('p', { class: 'lis-instruccion', text: 'Escucha la sílaba e identifica su tono.' }),
      botonRepetir(),
      botones,
    ];

    if (resuelto) {
      cuerpo.push(
        bandaVeredicto(
          silaba.hanzi,
          `${silaba.pinyin} (tono ${String(silaba.tono)}) · ${silaba.es}`,
        ),
        botonSiguiente(nuevoTono),
      );
    }

    root.replaceChildren(el('section', { class: 'lis' }, ...cuerpo));
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
      { class: 'lis-opciones lis-opciones--grande' },
      ...estado.opciones.map((op) => {
        const esCorrecta = op.id === lexema.id;
        const clases = ['lis-opcion'];
        if (resuelto) {
          if (esCorrecta) {
            clases.push('is-correcta');
          } else if (estado.respuesta === op.id) {
            clases.push('is-fallo');
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
      el('p', { class: 'lis-instruccion', text: 'Escucha y elige el carácter correcto.' }),
      botonRepetir(),
      grid,
    ];

    if (resuelto) {
      cuerpo.push(
        bandaVeredicto(lexema.hanzi, `${lexema.pinyin} · ${lexema.es}`),
        botonSiguiente(nuevaOpcion),
      );
    }

    root.replaceChildren(el('section', { class: 'lis' }, ...cuerpo));
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
