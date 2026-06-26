// Helper de micro-interaccion: envuelve un cambio de UI en una view transition
// cuando el navegador la soporta, con fallback a ejecucion directa.
import { aplicarTransicion, type DocConTransicion } from './transition.logic';

/**
 * Ejecuta fn (normalmente una mutacion de estado + render) dentro de
 * document.startViewTransition si existe; si no, llama a fn directamente.
 */
export function conTransicion(fn: () => void | Promise<void>): void {
  const doc =
    typeof document === 'undefined' ? undefined : (document as unknown as DocConTransicion);
  aplicarTransicion(doc, fn);
}
