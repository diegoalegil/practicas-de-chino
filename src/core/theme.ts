// Gestión del tema (claro/oscuro/auto) con persistencia en localStorage.
// "auto" sigue la preferencia del sistema vía media query y no fija data-theme.

export type Tema = 'auto' | 'claro' | 'oscuro';

export const CLAVE_TEMA = 'pc.tema';

const TEMAS_VALIDOS: ReadonlySet<string> = new Set<Tema>(['auto', 'claro', 'oscuro']);

/** ¿Es un valor de tema válido? */
export function esTema(valor: string | null): valor is Tema {
  return valor !== null && TEMAS_VALIDOS.has(valor);
}

/** Lee el tema guardado; si no hay (o es inválido), devuelve "auto". */
export function temaGuardado(): Tema {
  try {
    const valor = localStorage.getItem(CLAVE_TEMA);
    return esTema(valor) ? valor : 'auto';
  } catch {
    return 'auto';
  }
}

/**
 * Aplica el tema al documento: pone o quita data-theme en <html> y lo persiste.
 * - "claro"  -> data-theme="light"
 * - "oscuro" -> data-theme="dark"
 * - "auto"   -> sin data-theme (respeta prefers-color-scheme)
 */
export function aplicaTema(tema: Tema): void {
  const raiz = document.documentElement;
  if (tema === 'claro') {
    raiz.setAttribute('data-theme', 'light');
  } else if (tema === 'oscuro') {
    raiz.setAttribute('data-theme', 'dark');
  } else {
    raiz.removeAttribute('data-theme');
  }
  try {
    localStorage.setItem(CLAVE_TEMA, tema);
  } catch {
    // Persistencia no disponible (p. ej. modo privado): no es crítico.
  }
}

/** Llamar al arrancar la app para reaplicar el tema persistido. */
export function aplicarTemaGuardado(): void {
  aplicaTema(temaGuardado());
}
