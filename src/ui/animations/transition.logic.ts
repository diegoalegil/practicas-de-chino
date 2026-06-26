// Logica pura para transiciones de pagina: decide si usar la View Transitions
// API o el fallback directo. Aislada del DOM real para poder testearla.

export interface DocConTransicion {
  startViewTransition?: (callback: () => void | Promise<void>) => unknown;
}

/** Indica si el documento soporta document.startViewTransition. */
export function soportaViewTransition(doc: DocConTransicion | undefined): boolean {
  return typeof doc?.startViewTransition === 'function';
}

/**
 * Aplica fn dentro de una view transition si esta disponible; si no, la ejecuta
 * directamente. Devuelve true si se uso la API nativa.
 */
export function aplicarTransicion(
  doc: DocConTransicion | undefined,
  fn: () => void | Promise<void>,
): boolean {
  if (doc && typeof doc.startViewTransition === 'function') {
    doc.startViewTransition(fn);
    return true;
  }
  void fn();
  return false;
}
