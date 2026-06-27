import type { View } from '../../types';
import { el } from '../../ui/dom';
import './reading.css';
import { hablar } from '../../core/audio';
import { get, put } from '../../core/storage';
import { TEXTOS } from './data';
import {
  contarHanzi,
  corregir,
  esCorrecta,
  segmentar,
  velocidadCpm,
  type GlosaLexica,
  type NivelLectura,
  type PreguntaComprension,
  type TextoLectura,
} from './reader.logic';
import { agregarLexemaAlSrs } from '../vocab/agregar';
import { LEXEMAS } from '../../content';

const LEXEMA_POR_HANZI = new Map(LEXEMAS.map((l) => [l.hanzi, l.id] as const));

interface ProgresoLectura {
  id: string;
  completado: boolean;
  aciertos: number;
  totalPreguntas: number;
  cpm: number;
  fecha: string;
}

const NIVEL_ETIQUETA: Record<NivelLectura, string> = {
  intermedio: 'Intermedio',
  'intermedio-alto': 'Intermedio-alto',
  avanzado: 'Avanzado',
};

function claveProgreso(id: string): string {
  return `lectura:${id}`;
}

export function createReadingView(): View {
  let root: HTMLElement;
  let textoActivo: TextoLectura | undefined;
  let elecciones: Array<number | undefined> = [];
  let respondidas: boolean[] = [];
  let inicioMs = 0;
  let transcurridoMs = 0;
  let finalizado = false;
  let cronoTimer: ReturnType<typeof setInterval> | undefined;
  let popover: HTMLElement | undefined;
  const progresoPorTexto = new Map<string, ProgresoLectura>();

  function pararCrono(): void {
    if (cronoTimer !== undefined) {
      clearInterval(cronoTimer);
      cronoTimer = undefined;
    }
  }

  function cerrarPopover(): void {
    if (popover) {
      popover.remove();
      popover = undefined;
    }
    for (const activa of root.querySelectorAll('.lectura-palabra.is-activa')) {
      activa.classList.remove('is-activa');
    }
  }

  function formatearTiempo(ms: number): string {
    const totalSeg = Math.floor(ms / 1000);
    const min = Math.floor(totalSeg / 60);
    const seg = totalSeg % 60;
    return `${String(min).padStart(2, '0')}:${String(seg).padStart(2, '0')}`;
  }

  function abrirListado(): void {
    pararCrono();
    cerrarPopover();
    textoActivo = undefined;
    finalizado = false;
    render();
  }

  function abrirTexto(texto: TextoLectura): void {
    cerrarPopover();
    textoActivo = texto;
    elecciones = texto.preguntas.map(() => undefined);
    respondidas = texto.preguntas.map(() => false);
    finalizado = false;
    inicioMs = Date.now();
    transcurridoMs = 0;
    pararCrono();
    cronoTimer = setInterval(() => {
      if (!finalizado) {
        transcurridoMs = Date.now() - inicioMs;
        actualizarCrono();
      }
    }, 1000);
    render();
  }

  function actualizarCrono(): void {
    const nodo = root.querySelector('.lectura__crono');
    if (nodo) {
      nodo.textContent = `Tiempo: ${formatearTiempo(transcurridoMs)}`;
    }
  }

  function todasRespondidas(): boolean {
    return respondidas.length > 0 && respondidas.every((r) => r);
  }

  function intentarFinalizar(texto: TextoLectura): void {
    if (!todasRespondidas() || finalizado) {
      return;
    }
    finalizado = true;
    transcurridoMs = Date.now() - inicioMs;
    pararCrono();
    const aciertos = corregir(texto.preguntas, elecciones);
    const cpm = velocidadCpm(contarHanzi(texto.cuerpo), transcurridoMs);
    const progreso: ProgresoLectura = {
      id: texto.id,
      completado: true,
      aciertos,
      totalPreguntas: texto.preguntas.length,
      cpm,
      fecha: new Date().toISOString(),
    };
    progresoPorTexto.set(texto.id, progreso);
    void put<ProgresoLectura>('progress', { ...progreso, id: claveProgreso(texto.id) });
    render();
  }

  function elegir(indicePregunta: number, opcion: number): void {
    if (respondidas[indicePregunta]) {
      return;
    }
    elecciones[indicePregunta] = opcion;
    respondidas[indicePregunta] = true;
    render();
  }

  function mostrarPopover(ancla: HTMLElement, glosa: GlosaLexica): void {
    cerrarPopover();
    ancla.classList.add('is-activa');
    const nuevo = el(
      'div',
      { class: 'lectura-popover', attrs: { role: 'dialog', 'aria-label': glosa.es } },
      el('span', { class: 'lectura-popover__hanzi', text: glosa.hanzi }),
      el('span', { class: 'lectura-popover__pinyin', text: glosa.pinyin }),
      el('span', { class: 'lectura-popover__es', text: glosa.es }),
      el('button', {
        class: 'lectura-popover__audio',
        text: '🔊 Escuchar',
        attrs: { type: 'button', 'aria-label': `Escuchar ${glosa.hanzi}` },
        on: {
          click: (event) => {
            event.stopPropagation();
            hablar(glosa.hanzi);
          },
        },
      }),
    );
    const lexId = LEXEMA_POR_HANZI.get(glosa.hanzi);
    if (lexId !== undefined) {
      nuevo.append(
        el('button', {
          class: 'lectura-popover__srs',
          text: '➕ Añadir a repaso',
          attrs: { type: 'button', 'aria-label': `Añadir ${glosa.hanzi} a repaso` },
          on: {
            click: (event) => {
              event.stopPropagation();
              const boton = event.currentTarget;
              if (boton instanceof HTMLButtonElement) {
                boton.disabled = true;
                void agregarLexemaAlSrs(lexId, new Date()).then((creada) => {
                  boton.textContent = creada ? '✓ Añadido' : '✓ Ya estaba';
                });
              }
            },
          },
        }),
      );
    }

    document.body.append(nuevo);
    popover = nuevo;

    const rectAncla = ancla.getBoundingClientRect();
    const rectPop = nuevo.getBoundingClientRect();
    let left = rectAncla.left;
    if (left + rectPop.width > window.innerWidth - 8) {
      left = window.innerWidth - rectPop.width - 8;
    }
    if (left < 8) {
      left = 8;
    }
    let top = rectAncla.bottom + 8;
    if (top + rectPop.height > window.innerHeight - 8) {
      top = rectAncla.top - rectPop.height - 8;
    }
    nuevo.style.left = `${String(Math.round(left))}px`;
    nuevo.style.top = `${String(Math.round(top))}px`;
  }

  function renderCuerpo(texto: TextoLectura): HTMLElement {
    const segmentos = segmentar(texto.cuerpo, texto.glosas);
    const hijos: (Node | string)[] = segmentos.map((seg) => {
      if (!seg.glosa) {
        return seg.texto;
      }
      const glosa = seg.glosa;
      return el('button', {
        class: 'lectura-palabra',
        text: seg.texto,
        attrs: { type: 'button', 'aria-label': `${glosa.hanzi}: ${glosa.es}` },
        on: {
          click: (event) => {
            event.stopPropagation();
            mostrarPopover(event.currentTarget as HTMLElement, glosa);
          },
        },
      });
    });
    return el('div', { class: 'lectura__cuerpo', attrs: { lang: 'zh-CN' } }, ...hijos);
  }

  function renderPregunta(pregunta: PreguntaComprension, indice: number): HTMLElement {
    const yaRespondida = respondidas[indice] === true;
    const eleccion = elecciones[indice];

    const opciones = pregunta.opciones.map((opcion, i) => {
      let clase = 'lectura-opcion';
      if (yaRespondida) {
        if (i === pregunta.correcta) {
          clase += ' is-correcta';
        } else if (i === eleccion) {
          clase += ' is-incorrecta';
        }
      }
      return el('button', {
        class: clase,
        text: opcion,
        attrs: yaRespondida ? { type: 'button', disabled: 'true' } : { type: 'button' },
        on: {
          click: () => {
            elegir(indice, i);
          },
        },
      });
    });

    const hijos: (Node | string)[] = [
      el('p', {
        class: 'lectura-pregunta__enunciado',
        text: `${String(indice + 1)}. ${pregunta.enunciado}`,
      }),
      el('div', { class: 'lectura-pregunta__opciones' }, ...opciones),
    ];

    if (yaRespondida && eleccion !== undefined) {
      const ok = esCorrecta(pregunta, eleccion);
      hijos.push(
        el('p', {
          class: `lectura-pregunta__feedback ${ok ? 'is-ok' : 'is-fail'}`,
          text: `${ok ? '✓ Correcto. ' : '✗ Incorrecto. '}${pregunta.explicacion}`,
        }),
      );
    }

    return el('div', { class: 'lectura-pregunta' }, ...hijos);
  }

  function renderResultado(texto: TextoLectura): HTMLElement {
    const cpm = velocidadCpm(contarHanzi(texto.cuerpo), transcurridoMs);
    const aciertos = corregir(texto.preguntas, elecciones);
    return el(
      'div',
      { class: 'lectura__resultado' },
      el('p', { class: 'lectura__resultado-marca', attrs: { 'aria-hidden': 'true' }, text: '成' }),
      el(
        'p',
        { class: 'lectura__resultado-detalle' },
        'Comprensión: ',
        el('strong', { text: `${String(aciertos)}/${String(texto.preguntas.length)}` }),
      ),
      el(
        'p',
        { class: 'lectura__resultado-detalle' },
        'Tiempo: ',
        el('strong', { text: formatearTiempo(transcurridoMs) }),
      ),
      el(
        'p',
        { class: 'lectura__resultado-detalle' },
        'Velocidad: ',
        el('strong', { text: `${String(cpm)} car/min` }),
      ),
      el('a', {
        class: 'lectura__btn',
        attrs: { href: '#/lectura' },
        text: 'Otro texto',
        on: {
          click: (event) => {
            event.preventDefault();
            abrirListado();
          },
        },
      }),
    );
  }

  function renderLector(texto: TextoLectura): void {
    const cabecera = el(
      'div',
      { class: 'lectura__cabecera' },
      el('button', {
        class: 'lectura__volver',
        text: '← Volver',
        attrs: { type: 'button' },
        on: {
          click: () => {
            abrirListado();
          },
        },
      }),
      el('h2', { class: 'lectura__cabecera-titulo', attrs: { lang: 'zh-CN' }, text: texto.titulo }),
    );

    const crono = el('p', {
      class: 'lectura__crono',
      text: `Tiempo: ${formatearTiempo(transcurridoMs)}`,
    });

    const glosaEs = el(
      'details',
      { class: 'lectura__glosa-es' },
      el('summary', { text: 'Ver traducción completa' }),
      el('p', { text: texto.glosaEs }),
    );

    const preguntas = el(
      'section',
      { class: 'lectura__preguntas' },
      el('h3', { class: 'lectura__preguntas-titulo', text: 'Preguntas de comprensión' }),
      ...texto.preguntas.map((pregunta, i) => renderPregunta(pregunta, i)),
    );

    const hijos: (Node | string)[] = [cabecera, crono, renderCuerpo(texto), glosaEs, preguntas];

    if (finalizado) {
      hijos.push(renderResultado(texto));
    }

    root.replaceChildren(el('section', { class: 'lectura' }, ...hijos));

    if (!finalizado && todasRespondidas()) {
      intentarFinalizar(texto);
    }
  }

  function renderListado(): void {
    const items = TEXTOS.map((texto) => {
      const progreso = progresoPorTexto.get(texto.id);
      const meta: (Node | string)[] = [
        el('span', { class: 'lectura-item__nivel', text: NIVEL_ETIQUETA[texto.nivel] }),
      ];
      if (progreso?.completado) {
        meta.push(
          el('span', {
            class: 'lectura-item__visto',
            text: `✓ ${String(progreso.aciertos)}/${String(progreso.totalPreguntas)} · ${String(progreso.cpm)} c/m`,
          }),
        );
      }
      return el(
        'li',
        {},
        el(
          'button',
          {
            class: 'lectura-item',
            attrs: { type: 'button' },
            on: {
              click: () => {
                abrirTexto(texto);
              },
            },
          },
          el('span', {
            class: 'lectura-item__titulo',
            attrs: { lang: 'zh-CN' },
            text: texto.titulo,
          }),
          el('span', { class: 'lectura-item__meta' }, ...meta),
        ),
      );
    });

    root.replaceChildren(
      el(
        'section',
        { class: 'lectura' },
        el(
          'div',
          { class: 'lectura__sec-h' },
          el('h2', { class: 'lectura__titulo-seccion', text: 'Lectura' }),
          el('div', { class: 'lectura__brush', attrs: { 'aria-hidden': 'true' } }),
        ),
        el('p', {
          class: 'lectura__intro',
          text: 'Toca las palabras subrayadas para ver su glosa. Al terminar, responde las preguntas.',
        }),
        el('ul', { class: 'lectura__lista' }, ...items),
      ),
    );
  }

  function render(): void {
    if (textoActivo) {
      renderLector(textoActivo);
    } else {
      renderListado();
    }
  }

  return {
    async mount(target) {
      root = target;
      root.replaceChildren(el('p', { class: 'lectura__cargando', text: 'Cargando textos…' }));
      for (const texto of TEXTOS) {
        const guardado = await get<ProgresoLectura>('progress', claveProgreso(texto.id));
        if (guardado) {
          progresoPorTexto.set(texto.id, { ...guardado, id: texto.id });
        }
      }
      render();
    },
    unmount() {
      pararCrono();
      cerrarPopover();
    },
  };
}
