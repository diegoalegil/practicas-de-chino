// Logica pura del onboarding de primer uso.
// - Define los pasos (contenido) y un pequeno modelo de navegacion sin DOM.
// - Encapsula la lectura/escritura del flag en localStorage para poder testear
//   por separado el comportamiento de "ya visto".
//
// No toca el DOM ni el CSS: todo eso vive en index.ts / onboarding.css.

export const CLAVE_ONBOARDING = 'pc.onboarding';
export const VALOR_HECHO = 'hecho';

export interface PasoOnboarding {
  readonly id: string;
  /** Glifo/hanzi grande mostrado en el hero (.onb-hero). */
  readonly hero: string;
  readonly titulo: string;
  readonly cuerpo: string;
  /** Texto opcional para una etiqueta .chip sobre el titulo. */
  readonly chip?: string;
  /** Variante visual del chip: '' (acento) | 'jade' | 'gold'. */
  readonly chipVariante?: 'jade' | 'gold';
}

export const PASOS: readonly PasoOnboarding[] = [
  {
    id: 'bienvenida',
    hero: '练',
    chip: '练中文',
    titulo: 'Despierta tu chino',
    cuerpo:
      'Bienvenido a tu rincon de practica diaria. Pequenos gestos, todos los dias, para que el chino vuelva a fluir.',
  },
  {
    id: 'reactivacion',
    hero: '回',
    chip: 'Reactivacion',
    chipVariante: 'jade',
    titulo: 'No empiezas de cero',
    cuerpo:
      'Ya sabes mas de lo que crees. Aqui reactivamos lo que tienes dormido en lugar de hacerte aprenderlo todo otra vez.',
  },
  {
    id: 'srs',
    hero: '复',
    chip: 'Repaso espaciado',
    chipVariante: 'gold',
    titulo: 'Un poco cada dia',
    cuerpo:
      'El repaso espaciado (SRS) te muestra cada palabra justo antes de que la olvides. Unos minutos diarios bastan para fijarla.',
  },
  {
    id: 'instalar',
    hero: '装',
    chip: 'Instalala',
    titulo: 'Llevala en tu iPhone',
    cuerpo:
      'En Safari, toca Compartir y luego "Anadir a pantalla de inicio". La tendras a mano como una app mas.',
  },
];

/** Estado minimo de navegacion entre pasos (indice + total). */
export interface EstadoOnboarding {
  readonly indice: number;
  readonly total: number;
}

export function estadoInicial(total: number = PASOS.length): EstadoOnboarding {
  return { indice: 0, total };
}

function limitar(indice: number, total: number): number {
  if (total <= 0) {
    return 0;
  }
  if (indice < 0) {
    return 0;
  }
  if (indice > total - 1) {
    return total - 1;
  }
  return indice;
}

export function irA(estado: EstadoOnboarding, indice: number): EstadoOnboarding {
  return { indice: limitar(indice, estado.total), total: estado.total };
}

export function siguiente(estado: EstadoOnboarding): EstadoOnboarding {
  return irA(estado, estado.indice + 1);
}

export function anterior(estado: EstadoOnboarding): EstadoOnboarding {
  return irA(estado, estado.indice - 1);
}

export function esUltimo(estado: EstadoOnboarding): boolean {
  return estado.total > 0 && estado.indice >= estado.total - 1;
}

export function esPrimero(estado: EstadoOnboarding): boolean {
  return estado.indice <= 0;
}

/**
 * Decide hacia donde mover el indice a partir de un desplazamiento horizontal
 * de swipe (dx en px). Devuelve el indice destino respetando los limites.
 * dx < 0 (arrastrar hacia la izquierda) avanza; dx > 0 retrocede.
 */
export function destinoSwipe(estado: EstadoOnboarding, dx: number, umbral = 48): number {
  if (dx <= -umbral) {
    return limitar(estado.indice + 1, estado.total);
  }
  if (dx >= umbral) {
    return limitar(estado.indice - 1, estado.total);
  }
  return estado.indice;
}

function almacenamiento(): Storage | undefined {
  try {
    if (typeof localStorage === 'undefined') {
      return undefined;
    }
    return localStorage;
  } catch {
    // Acceso a localStorage puede lanzar (modo privado/SSR). Lo tratamos como
    // "no disponible" sin romper la app.
    return undefined;
  }
}

/** true si todavia no se ha completado el onboarding (o no se puede leer). */
export function debeMostrarOnboarding(): boolean {
  const store = almacenamiento();
  if (!store) {
    return false;
  }
  try {
    return store.getItem(CLAVE_ONBOARDING) !== VALOR_HECHO;
  } catch {
    return false;
  }
}

/** Marca el onboarding como completado en localStorage. */
export function marcarOnboardingHecho(): void {
  const store = almacenamiento();
  if (!store) {
    return;
  }
  try {
    store.setItem(CLAVE_ONBOARDING, VALOR_HECHO);
  } catch {
    // Silencioso: si no se puede persistir, el peor caso es volver a mostrarlo.
  }
}

/** Util para tests/QA: vuelve a habilitar el onboarding. */
export function reiniciarOnboarding(): void {
  const store = almacenamiento();
  if (!store) {
    return;
  }
  try {
    store.removeItem(CLAVE_ONBOARDING);
  } catch {
    // ignorar
  }
}
