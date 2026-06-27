// Lectura/escritura de preferencias del módulo Ajustes en localStorage.
// Lógica pura y testeable: usa un Storage inyectable (por defecto localStorage).

export const CLAVE_ESCALA_FUENTE = 'pc.escalaFuente';
export const CLAVE_VOZ = 'pc.voz';
export const CLAVE_VELOCIDAD = 'pc.velocidad';
export const CLAVE_REDUCE_MOTION = 'pc.reduceMotion';

/** Límites de la escala de fuente (1 = 100%). */
export const ESCALA_MIN = 0.85;
export const ESCALA_MAX = 1.4;
export const ESCALA_DEFECTO = 1;

/** Límites de la velocidad de la voz (rate de SpeechSynthesis). */
export const VELOCIDAD_MIN = 0.5;
export const VELOCIDAD_MAX = 1.5;
export const VELOCIDAD_DEFECTO = 0.9;

/** Subconjunto mínimo de la Storage API que necesitamos (inyectable en tests). */
export interface PrefsStorage {
  getItem(clave: string): string | null;
  setItem(clave: string, valor: string): void;
}

function storagePorDefecto(): PrefsStorage | null {
  try {
    return globalThis.localStorage;
  } catch {
    return null;
  }
}

function leer(store: PrefsStorage | null, clave: string): string | null {
  if (!store) {
    return null;
  }
  try {
    return store.getItem(clave);
  } catch {
    return null;
  }
}

function escribir(store: PrefsStorage | null, clave: string, valor: string): void {
  if (!store) {
    return;
  }
  try {
    store.setItem(clave, valor);
  } catch {
    // Persistencia no disponible: ignorar.
  }
}

/** Restringe un número al rango [min, max]; devuelve fallback si no es finito. */
export function limita(valor: number, min: number, max: number, fallback: number): number {
  if (!Number.isFinite(valor)) {
    return fallback;
  }
  return Math.min(max, Math.max(min, valor));
}

// --- Escala de fuente -------------------------------------------------------

export function leerEscalaFuente(store: PrefsStorage | null = storagePorDefecto()): number {
  const crudo = leer(store, CLAVE_ESCALA_FUENTE);
  const num = crudo === null ? NaN : Number.parseFloat(crudo);
  return limita(num, ESCALA_MIN, ESCALA_MAX, ESCALA_DEFECTO);
}

export function guardarEscalaFuente(
  valor: number,
  store: PrefsStorage | null = storagePorDefecto(),
): number {
  const limitado = limita(valor, ESCALA_MIN, ESCALA_MAX, ESCALA_DEFECTO);
  escribir(store, CLAVE_ESCALA_FUENTE, String(limitado));
  return limitado;
}

/** Aplica la escala como variable CSS --escala-fuente en :root. Idempotente. */
export function aplicarEscalaFuente(valor: number, raiz: HTMLElement): void {
  const limitado = limita(valor, ESCALA_MIN, ESCALA_MAX, ESCALA_DEFECTO);
  raiz.style.setProperty('--escala-fuente', String(limitado));
}

/** Lee y aplica la escala guardada al documento (llamar al arrancar). */
export function aplicarEscalaGuardada(
  raiz: HTMLElement = document.documentElement,
  store: PrefsStorage | null = storagePorDefecto(),
): void {
  aplicarEscalaFuente(leerEscalaFuente(store), raiz);
}

// --- Velocidad de la voz ----------------------------------------------------

export function leerVelocidad(store: PrefsStorage | null = storagePorDefecto()): number {
  const crudo = leer(store, CLAVE_VELOCIDAD);
  const num = crudo === null ? NaN : Number.parseFloat(crudo);
  return limita(num, VELOCIDAD_MIN, VELOCIDAD_MAX, VELOCIDAD_DEFECTO);
}

export function guardarVelocidad(
  valor: number,
  store: PrefsStorage | null = storagePorDefecto(),
): number {
  const limitado = limita(valor, VELOCIDAD_MIN, VELOCIDAD_MAX, VELOCIDAD_DEFECTO);
  escribir(store, CLAVE_VELOCIDAD, String(limitado));
  return limitado;
}

// --- Voz preferida (nombre) -------------------------------------------------

export function leerVozPreferida(store: PrefsStorage | null = storagePorDefecto()): string | null {
  return leer(store, CLAVE_VOZ);
}

export function guardarVozPreferida(
  nombre: string,
  store: PrefsStorage | null = storagePorDefecto(),
): void {
  escribir(store, CLAVE_VOZ, nombre);
}

// --- Reduce motion ----------------------------------------------------------

export function leerReduceMotion(store: PrefsStorage | null = storagePorDefecto()): boolean {
  return leer(store, CLAVE_REDUCE_MOTION) === '1';
}

export function guardarReduceMotion(
  activo: boolean,
  store: PrefsStorage | null = storagePorDefecto(),
): void {
  escribir(store, CLAVE_REDUCE_MOTION, activo ? '1' : '0');
}

/** Aplica/quita data-reduce-motion en el documento. Idempotente. */
export function aplicarReduceMotion(activo: boolean, raiz: HTMLElement): void {
  if (activo) {
    raiz.setAttribute('data-reduce-motion', '1');
  } else {
    raiz.removeAttribute('data-reduce-motion');
  }
}

/** Lee y aplica el ajuste de reduce-motion guardado (llamar al arrancar). */
export function aplicarReduceMotionGuardado(
  raiz: HTMLElement = document.documentElement,
  store: PrefsStorage | null = storagePorDefecto(),
): void {
  aplicarReduceMotion(leerReduceMotion(store), raiz);
}
