// Splash de entrada 水墨: revela el caracter 练 y deja caer el sello 印 con
// overshoot, luego hace fade y se elimina del DOM. Respeta reduced-motion.
import './splash.css';
import { el } from '../dom';
import {
  planificarSplash,
  prefiereMenosMovimiento,
  type PlanAnimacion,
  type PlanFotograma,
} from './splash.logic';

const DURACION_BASE = 1600;

function aKeyframes(fotogramas: readonly PlanFotograma[]): Keyframe[] {
  return fotogramas.map((f) => {
    const k: Keyframe = { offset: f.offset };
    if (f.opacity !== undefined) {
      k['opacity'] = f.opacity;
    }
    if (f.transform !== undefined) {
      k['transform'] = f.transform;
    }
    if (f.clipPath !== undefined) {
      k['clipPath'] = f.clipPath;
    }
    return k;
  });
}

function animar(nodo: Element, plan: PlanAnimacion): Animation | undefined {
  if (typeof nodo.animate !== 'function') {
    return undefined;
  }
  return nodo.animate(aKeyframes(plan.keyframes), {
    duration: plan.duracion,
    delay: plan.retraso,
    easing: plan.easing,
    fill: 'both',
  });
}

/**
 * Muestra el splash a pantalla completa y resuelve cuando termina (y se ha
 * eliminado del DOM). En reduced-motion resuelve casi de inmediato.
 */
export function mostrarSplash(): Promise<void> {
  if (typeof document === 'undefined' || !document.body) {
    return Promise.resolve();
  }

  const reducido = prefiereMenosMovimiento();
  const plan = planificarSplash({ duracionBase: DURACION_BASE, reducido });

  const caracter = el('span', {
    class: 'splash__hanzi',
    attrs: { 'aria-hidden': 'true' },
    text: '练',
  });
  const sello = el('span', {
    class: 'splash__sello',
    attrs: { 'aria-hidden': 'true' },
    text: '印',
  });
  const escena = el('div', { class: 'splash__escena' }, caracter, sello);
  const overlay = el(
    'div',
    {
      class: 'splash',
      attrs: { role: 'presentation', 'aria-hidden': 'true' },
    },
    escena,
  );
  if (reducido) {
    overlay.classList.add('splash--reducido');
  }

  document.body.append(overlay);

  return new Promise<void>((resolve) => {
    let resuelto = false;
    const finalizar = (): void => {
      if (resuelto) {
        return;
      }
      resuelto = true;
      overlay.remove();
      resolve();
    };

    animar(caracter, plan.caracter);
    animar(sello, plan.sello);
    const salida = animar(overlay, plan.fadeSalida);

    if (salida) {
      salida.addEventListener('finish', finalizar, { once: true });
      salida.addEventListener('cancel', finalizar, { once: true });
    }
    // Red de seguridad por si la Web Animations API no dispara o no existe.
    window.setTimeout(finalizar, plan.total + 120);
  });
}
