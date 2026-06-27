// Onboarding de primer uso (clave onboarding).
//
// mostrarOnboarding(): monta un overlay a pantalla completa con la estetica
// .onb del sistema de diseno, 4 pasos navegables con botones, dots y swipe.
// Al terminar (boton "Empezar" o saltar) marca localStorage pc.onboarding=hecho
// y resuelve la promesa, eliminando el overlay del DOM.
//
// debeMostrarOnboarding() reexporta el helper de la logica para que main.ts
// decida si llamarlo.

import { el } from '../../ui/dom';
import './onboarding.css';
import {
  PASOS,
  type EstadoOnboarding,
  type PasoOnboarding,
  destinoSwipe,
  esUltimo,
  estadoInicial,
  irA,
  marcarOnboardingHecho,
  siguiente,
} from './onboarding.logic';

export { debeMostrarOnboarding } from './onboarding.logic';

function prefiereMenosMovimiento(): boolean {
  return typeof matchMedia === 'function' && matchMedia('(prefers-reduced-motion: reduce)').matches;
}

function crearSlide(paso: PasoOnboarding): HTMLElement {
  const hijos: HTMLElement[] = [];

  hijos.push(el('div', { class: 'onb-hero', attrs: { 'aria-hidden': 'true' }, text: paso.hero }));

  const chipRow = el('div', { class: 'ob-chiprow' });
  if (paso.chip !== undefined) {
    const clase = paso.chipVariante ? `chip ${paso.chipVariante}` : 'chip';
    chipRow.append(el('span', { class: clase, text: paso.chip }));
  }
  hijos.push(chipRow);

  hijos.push(el('h2', { class: 'onb-title', text: paso.titulo }));
  hijos.push(el('p', { class: 'onb-body', text: paso.cuerpo }));

  if (paso.id === 'instalar') {
    hijos.push(
      el(
        'span',
        { class: 'ob-install' },
        el('span', { attrs: { 'aria-hidden': 'true' }, text: '↑' }),
        el('span', { html: 'Compartir → <b>Anadir a pantalla de inicio</b>' }),
      ),
    );
  }

  return el(
    'div',
    { class: 'ob-slide', attrs: { role: 'group', 'aria-roledescription': 'diapositiva' } },
    ...hijos,
  );
}

/**
 * Muestra el onboarding a pantalla completa. Resuelve cuando el usuario lo
 * completa o lo salta (y el overlay se ha eliminado del DOM). Idempotente: si
 * ya hay un overlay montado, no monta otro.
 */
export function mostrarOnboarding(): Promise<void> {
  if (typeof document === 'undefined' || !document.body) {
    return Promise.resolve();
  }
  if (document.querySelector('.ob-onb')) {
    return Promise.resolve();
  }

  const reducido = prefiereMenosMovimiento();
  let estado: EstadoOnboarding = estadoInicial(PASOS.length);

  const strip = el('div', { class: 'ob-strip' }, ...PASOS.map((paso) => crearSlide(paso)));
  const viewport = el('div', { class: 'ob-vp' }, strip);

  const dots = el('div', { class: 'dots', attrs: { 'aria-hidden': 'true' } });
  const puntos: HTMLElement[] = PASOS.map(() => el('span', { class: 'dot' }));
  dots.append(...puntos);

  const btnAtras = el('button', {
    class: 'btn btn-ghost btn-sm',
    text: 'Atras',
    attrs: { type: 'button' },
  });
  const btnPrimario = el('button', {
    class: 'btn btn-primary ob-grow',
    text: 'Siguiente',
    attrs: { type: 'button' },
  });
  const acciones = el('div', { class: 'ob-actions' }, btnAtras, btnPrimario);

  const foot = el('div', { class: 'ob-foot' }, dots, acciones);

  const btnSaltar = el('button', {
    class: 'ob-skip',
    text: 'Saltar',
    attrs: { type: 'button', 'aria-label': 'Saltar la introduccion' },
  });

  const track = el('div', { class: 'onb-track' }, viewport);

  const overlay = el(
    'div',
    {
      class: 'onb ob-onb',
      attrs: { role: 'dialog', 'aria-modal': 'true', 'aria-label': 'Introduccion' },
    },
    btnSaltar,
    track,
    foot,
  );

  function pintar(): void {
    const offset = -estado.indice * 100;
    strip.style.transform = `translateX(${offset}%)`;
    puntos.forEach((p, i) => p.classList.toggle('on', i === estado.indice));
    btnAtras.style.visibility = estado.indice === 0 ? 'hidden' : 'visible';
    btnPrimario.textContent = esUltimo(estado) ? 'Empezar' : 'Siguiente';
    const activo = PASOS[estado.indice];
    if (activo) {
      overlay.setAttribute(
        'aria-label',
        `Introduccion, paso ${estado.indice + 1} de ${PASOS.length}: ${activo.titulo}`,
      );
    }
  }

  return new Promise<void>((resolve) => {
    let resuelto = false;

    const cerrar = (): void => {
      if (resuelto) {
        return;
      }
      resuelto = true;
      marcarOnboardingHecho();
      document.removeEventListener('keydown', onKey);
      const quitar = (): void => {
        overlay.remove();
      };
      if (reducido || typeof overlay.animate !== 'function') {
        quitar();
        resolve();
        return;
      }
      const salida = overlay.animate([{ opacity: 1 }, { opacity: 0 }], {
        duration: 240,
        easing: 'ease',
        fill: 'both',
      });
      const fin = (): void => {
        quitar();
        resolve();
      };
      salida.addEventListener('finish', fin, { once: true });
      salida.addEventListener('cancel', fin, { once: true });
      window.setTimeout(fin, 320);
    };

    const avanzar = (): void => {
      if (esUltimo(estado)) {
        cerrar();
        return;
      }
      estado = siguiente(estado);
      pintar();
    };

    btnPrimario.addEventListener('click', avanzar);
    btnAtras.addEventListener('click', () => {
      estado = irA(estado, estado.indice - 1);
      pintar();
    });
    btnSaltar.addEventListener('click', cerrar);

    function onKey(ev: KeyboardEvent): void {
      if (ev.key === 'ArrowRight') {
        avanzar();
      } else if (ev.key === 'ArrowLeft') {
        estado = irA(estado, estado.indice - 1);
        pintar();
      } else if (ev.key === 'Escape') {
        cerrar();
      } else if (ev.key === 'Enter') {
        avanzar();
      }
    }
    document.addEventListener('keydown', onKey);

    // Swipe tactil sobre el viewport.
    let inicioX: number | null = null;
    viewport.addEventListener(
      'touchstart',
      (ev) => {
        const t = ev.touches[0];
        if (!t) {
          return;
        }
        inicioX = t.clientX;
        strip.classList.add('ob-arrastrando');
      },
      { passive: true },
    );
    viewport.addEventListener(
      'touchmove',
      (ev) => {
        if (inicioX === null) {
          return;
        }
        const t = ev.touches[0];
        if (!t) {
          return;
        }
        const dx = t.clientX - inicioX;
        const base = -estado.indice * 100;
        const anchoVp = viewport.clientWidth || 1;
        const dxPct = (dx / anchoVp) * 100;
        strip.style.transform = `translateX(${base + dxPct}%)`;
      },
      { passive: true },
    );
    const finTouch = (ev: TouchEvent): void => {
      if (inicioX === null) {
        return;
      }
      const t = ev.changedTouches[0];
      const dx = t ? t.clientX - inicioX : 0;
      inicioX = null;
      strip.classList.remove('ob-arrastrando');
      estado = irA(estado, destinoSwipe(estado, dx));
      pintar();
    };
    viewport.addEventListener('touchend', finTouch, { passive: true });
    viewport.addEventListener('touchcancel', finTouch, { passive: true });

    document.body.append(overlay);
    if (reducido) {
      overlay.style.animation = 'none';
    }
    pintar();
  });
}
