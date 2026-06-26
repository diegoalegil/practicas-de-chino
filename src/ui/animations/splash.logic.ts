// Logica pura del splash de entrada: deteccion de reduced-motion y calculo de
// los keyframes/opciones de la animacion. Sin tocar el DOM para poder testear.

export interface OpcionesSplash {
  /** Duracion total objetivo en ms (sin contar el fade final). */
  duracionBase: number;
  /** Si el usuario pide menos movimiento. */
  reducido: boolean;
}

export interface PlanFotograma {
  offset: number;
  opacity?: number;
  transform?: string;
  clipPath?: string;
}

export interface PlanAnimacion {
  keyframes: PlanFotograma[];
  duracion: number;
  retraso: number;
  easing: string;
}

export interface PlanSplash {
  /** ms totales antes de resolver la promesa (incluye fade de salida). */
  total: number;
  caracter: PlanAnimacion;
  sello: PlanAnimacion;
  fadeSalida: PlanAnimacion;
}

/** Lee la media query de movimiento reducido de forma segura. */
export function prefiereMenosMovimiento(): boolean {
  if (typeof window === 'undefined' || typeof window.matchMedia !== 'function') {
    return false;
  }
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
}

const EASE_SUAVE = 'cubic-bezier(0.22, 1, 0.36, 1)';
const EASE_OVERSHOOT = 'cubic-bezier(0.34, 1.56, 0.64, 1)';

/**
 * Construye el plan completo de la animacion. Si esta en modo reducido
 * devuelve un plan casi instantaneo (solo opacidad, sin transform).
 */
export function planificarSplash(opciones: OpcionesSplash): PlanSplash {
  if (opciones.reducido) {
    const apenas: PlanAnimacion = {
      keyframes: [
        { offset: 0, opacity: 1 },
        { offset: 1, opacity: 1 },
      ],
      duracion: 1,
      retraso: 0,
      easing: 'linear',
    };
    return {
      total: 60,
      caracter: apenas,
      sello: apenas,
      fadeSalida: {
        keyframes: [
          { offset: 0, opacity: 1 },
          { offset: 1, opacity: 0 },
        ],
        duracion: 40,
        retraso: 10,
        easing: 'linear',
      },
    };
  }

  const base = opciones.duracionBase;
  const dRevelado = Math.round(base * 0.55);
  const dSello = Math.round(base * 0.4);
  const retrasoSello = Math.round(base * 0.45);
  const dFade = Math.round(base * 0.25);
  const retrasoFade = Math.max(dRevelado, retrasoSello + dSello);

  return {
    total: retrasoFade + dFade,
    caracter: {
      keyframes: [
        {
          offset: 0,
          opacity: 0,
          transform: 'scale(0.86)',
          clipPath: 'inset(0 0 100% 0)',
        },
        {
          offset: 0.6,
          opacity: 1,
          transform: 'scale(1.02)',
          clipPath: 'inset(0 0 0 0)',
        },
        {
          offset: 1,
          opacity: 1,
          transform: 'scale(1)',
          clipPath: 'inset(0 0 0 0)',
        },
      ],
      duracion: dRevelado,
      retraso: 0,
      easing: EASE_SUAVE,
    },
    sello: {
      keyframes: [
        { offset: 0, opacity: 0, transform: 'translateY(-60%) scale(1.4) rotate(-8deg)' },
        { offset: 0.7, opacity: 1, transform: 'translateY(6%) scale(0.94) rotate(2deg)' },
        { offset: 1, opacity: 1, transform: 'translateY(0) scale(1) rotate(0deg)' },
      ],
      duracion: dSello,
      retraso: retrasoSello,
      easing: EASE_OVERSHOOT,
    },
    fadeSalida: {
      keyframes: [
        { offset: 0, opacity: 1 },
        { offset: 1, opacity: 0 },
      ],
      duracion: dFade,
      retraso: retrasoFade,
      easing: EASE_SUAVE,
    },
  };
}
