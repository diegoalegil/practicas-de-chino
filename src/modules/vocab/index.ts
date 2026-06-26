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
  { grado: 1, etiqueta: 'Otra vez', clase: 'grade grade--otra' },
  { grado: 3, etiqueta: 'Bien', clase: 'grade grade--bien' },
  { grado: 4, etiqueta: 'Fácil', clase: 'grade grade--facil' },
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
        { class: 'vocab vocab--fin' },
        el('p', { class: 'vocab__hanzi-grande', attrs: { 'aria-hidden': 'true' }, text: '✓' }),
        el('p', { class: 'vocab__resumen', text: mensaje }),
        el('a', { class: 'btn btn--tinta', attrs: { href: '#/' }, text: 'Volver al inicio' }),
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

    const cara = el(
      'div',
      { class: `srs-card${estado.revelada ? ' is-revealed' : ''}` },
      el(
        'div',
        { class: 'srs-card__face srs-card__front' },
        el('span', { class: 'srs-card__hanzi', text: lexema.hanzi }),
        el('span', { class: 'srs-card__pista', text: 'Toca para revelar' }),
      ),
      el(
        'div',
        { class: 'srs-card__face srs-card__back' },
        el('span', { class: 'srs-card__pinyin', text: lexema.pinyin }),
        el('span', { class: 'srs-card__es', text: lexema.es }),
        ...(lexema.ejemplo
          ? [el('p', { class: 'srs-card__ejemplo', text: lexema.ejemplo.hanzi })]
          : []),
        el('button', {
          class: 'btn btn--audio',
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
    );

    if (!estado.revelada) {
      cara.addEventListener('click', () => {
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
            class: 'btn btn--tinta',
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

    root.replaceChildren(el('section', { class: 'vocab' }, progreso, cara, acciones));
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
