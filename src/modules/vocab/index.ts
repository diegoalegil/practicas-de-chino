import type { GradoFsrs, View } from '../../types';
import { el } from '../../ui/dom';
import './vocab.css';
import { hablar } from '../../core/audio';
import { lexemaPorId } from '../../content';
import { asegurarTarjetas, registrarRepaso, tarjetasVencidas } from './cards';
import {
  iniciarSesion,
  responder,
  revelar,
  tarjetaActual,
  terminada,
  type EstadoSesion,
} from './session';

const GRADOS: { grado: GradoFsrs; etiqueta: string; clase: string }[] = [
  { grado: 1, etiqueta: 'Otra vez', clase: 'vocab-btn vocab-btn--ghost' },
  { grado: 3, etiqueta: 'Bien', clase: 'vocab-btn vocab-btn--jade' },
  { grado: 4, etiqueta: 'Fácil', clase: 'vocab-btn vocab-btn--primary' },
];

export function createVocabView(): View {
  let root: HTMLElement;
  let estado: EstadoSesion;
  let total = 0;
  let mostradaEn = 0;

  function renderResumen(): void {
    const mensaje =
      total === 0
        ? '¡Todo al día! No tienes tarjetas pendientes ahora mismo.'
        : `Sesión completada: ${String(estado.aciertos)} de ${String(estado.completadas)} aciertos.`;
    root.replaceChildren(
      el(
        'section',
        { class: 'vocab vocab--fin scr' },
        el('div', {
          class: 'vocab-seal vocab-seal--jade',
          attrs: { 'aria-hidden': 'true' },
          text: '✓',
        }),
        el('p', { class: 'vocab__resumen', text: mensaje }),
        el('a', {
          class: 'vocab-btn vocab-btn--primary vocab-btn--block',
          attrs: { href: '#/' },
          text: 'Volver al inicio',
        }),
      ),
    );
  }

  function manejar(grado: GradoFsrs): void {
    const tarjeta = tarjetaActual(estado);
    if (!tarjeta) {
      return;
    }
    const latencia = Date.now() - mostradaEn;
    void registrarRepaso(tarjeta, grado, new Date(), latencia).then(() => {
      estado = responder(estado, grado);
      mostradaEn = Date.now();
      render();
    });
  }

  function render(): void {
    if (terminada(estado)) {
      renderResumen();
      return;
    }
    const tarjeta = tarjetaActual(estado);
    const lexema = tarjeta ? lexemaPorId(tarjeta.lexemaId) : undefined;
    if (!tarjeta || !lexema) {
      renderResumen();
      return;
    }

    const restantes = estado.cola.length - estado.indice;
    const progreso = el(
      'p',
      { class: 'vocab__progreso' },
      el('span', { text: `${String(restantes)} por repasar` }),
    );

    const flip = el(
      'div',
      { class: `vocab-flip${estado.revelada ? ' on' : ''}` },
      el(
        'div',
        { class: 'vocab-flip-inner' },
        el(
          'div',
          { class: 'vocab-face' },
          el('span', {
            class: 'vocab-wm',
            attrs: { 'aria-hidden': 'true' },
            text: lexema.hanzi,
          }),
          el('span', { class: 'vocab-card-hanzi', text: lexema.hanzi }),
          el('span', { class: 'vocab-card-pista', text: 'Toca para revelar' }),
        ),
        el(
          'div',
          { class: 'vocab-face vocab-face-back' },
          el('span', { class: 'vocab-card-pinyin', text: lexema.pinyin }),
          el('span', { class: 'vocab-card-es', text: lexema.es }),
          ...(lexema.ejemplo
            ? [el('p', { class: 'vocab-card-ejemplo', text: lexema.ejemplo.hanzi })]
            : []),
          el('button', {
            class: 'vocab-btn vocab-btn--audio vocab-btn--sm',
            text: '🔊 Escuchar',
            attrs: { type: 'button', 'aria-label': 'Escuchar pronunciación' },
            on: {
              click: (event) => {
                event.stopPropagation();
                hablar(lexema.hanzi);
              },
            },
          }),
        ),
      ),
    );

    if (!estado.revelada) {
      flip.addEventListener('click', () => {
        estado = revelar(estado);
        render();
      });
    }

    const acciones = estado.revelada
      ? el(
          'div',
          { class: 'vocab__grados' },
          ...GRADOS.map(({ grado, etiqueta, clase }) =>
            el('button', {
              class: clase,
              text: etiqueta,
              attrs: { type: 'button' },
              on: {
                click: () => {
                  manejar(grado);
                },
              },
            }),
          ),
        )
      : el(
          'div',
          { class: 'vocab__grados' },
          el('button', {
            class: 'vocab-btn vocab-btn--primary vocab-btn--block',
            text: 'Mostrar',
            attrs: { type: 'button' },
            on: {
              click: () => {
                estado = revelar(estado);
                render();
              },
            },
          }),
        );

    root.replaceChildren(el('section', { class: 'vocab scr' }, progreso, flip, acciones));
  }

  return {
    async mount(target) {
      root = target;
      root.replaceChildren(el('p', { class: 'vocab__cargando', text: 'Preparando tarjetas…' }));
      const ahora = new Date();
      await asegurarTarjetas(ahora);
      const vencidas = await tarjetasVencidas(ahora);
      total = vencidas.length;
      estado = iniciarSesion(vencidas);
      mostradaEn = Date.now();
      render();
    },
  };
}
