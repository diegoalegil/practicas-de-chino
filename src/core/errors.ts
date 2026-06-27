// Error boundary global + buffer de log en memoria.
//
// Engancha window.onerror y unhandledrejection para no perder fallos silenciosos,
// muestra un banner amable en español (sin culpar al usuario, tranquilizando
// sobre sus datos) y permite exportar el log para diagnóstico. NUNCA envía nada
// a la red: el log vive sólo en memoria y se descarga localmente si el usuario
// lo pide.

/** Una entrada del buffer de log. */
export interface EntradaLog {
  /** Marca de tiempo (ms). */
  t: number;
  /** Nivel/origen del evento. */
  nivel: 'error' | 'rechazo' | 'info';
  /** Mensaje legible. */
  mensaje: string;
  /** Pila de llamadas si está disponible. */
  stack?: string;
}

/** Máximo de entradas conservadas (anillo). */
const MAX_ENTRADAS = 50;

const buffer: EntradaLog[] = [];

/** Añade una entrada al buffer, descartando las más antiguas si rebosa. */
export function registrarLog(nivel: EntradaLog['nivel'], mensaje: string, stack?: string): void {
  const entrada: EntradaLog =
    stack === undefined
      ? { t: Date.now(), nivel, mensaje }
      : { t: Date.now(), nivel, mensaje, stack };
  buffer.push(entrada);
  if (buffer.length > MAX_ENTRADAS) {
    buffer.splice(0, buffer.length - MAX_ENTRADAS);
  }
}

/** Devuelve una copia inmutable del buffer de log. */
export function obtenerLog(): readonly EntradaLog[] {
  return buffer.slice();
}

/** Vacía el buffer (útil en tests y tras exportar). */
export function limpiarLog(): void {
  buffer.length = 0;
}

/** Serializa el log a texto plano legible para descargar. */
export function exportarLog(): string {
  if (buffer.length === 0) {
    return 'Sin eventos registrados.';
  }
  return buffer
    .map((e) => {
      const fecha = new Date(e.t).toISOString();
      const cab = `[${fecha}] ${e.nivel.toUpperCase()}: ${e.mensaje}`;
      return e.stack ? `${cab}\n${e.stack}` : cab;
    })
    .join('\n\n');
}

function mensajeDeError(error: unknown): { mensaje: string; stack?: string } {
  if (error instanceof Error) {
    return error.stack !== undefined
      ? { mensaje: error.message, stack: error.stack }
      : { mensaje: error.message };
  }
  if (typeof error === 'string') {
    return { mensaje: error };
  }
  try {
    return { mensaje: JSON.stringify(error) };
  } catch {
    return { mensaje: String(error) };
  }
}

// --- Banner (efectos DOM; no testeado) ---------------------------------------

const BANNER_ID = 'eb-banner';

function descargarTexto(nombre: string, contenido: string): void {
  const blob = new Blob([contenido], { type: 'text/plain' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = nombre;
  document.body.append(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
}

function mostrarBanner(): void {
  if (typeof document === 'undefined' || document.getElementById(BANNER_ID)) {
    return;
  }

  const banner = document.createElement('div');
  banner.id = BANNER_ID;
  banner.className = 'eb-banner';
  banner.setAttribute('role', 'alert');
  banner.setAttribute('aria-live', 'assertive');

  const cuerpo = document.createElement('div');
  cuerpo.className = 'eb-banner__body';

  const titulo = document.createElement('p');
  titulo.className = 'eb-banner__title';
  titulo.textContent = 'Algo falló, tus datos están a salvo';

  const sub = document.createElement('p');
  sub.className = 'eb-banner__sub';
  sub.textContent = 'Puedes recargar para continuar. Si vuelve a ocurrir, exporta el registro.';

  cuerpo.append(titulo, sub);

  const acciones = document.createElement('div');
  acciones.className = 'eb-banner__actions';

  const recargar = document.createElement('button');
  recargar.type = 'button';
  recargar.className = 'btn btn-primary btn-sm';
  recargar.textContent = 'Recargar';
  recargar.addEventListener('click', () => {
    location.reload();
  });

  const exportar = document.createElement('button');
  exportar.type = 'button';
  exportar.className = 'btn btn-ghost btn-sm';
  exportar.textContent = 'Exportar registro';
  exportar.addEventListener('click', () => {
    descargarTexto('practicas-de-chino-log.txt', exportarLog());
  });

  const cerrar = document.createElement('button');
  cerrar.type = 'button';
  cerrar.className = 'eb-banner__close';
  cerrar.setAttribute('aria-label', 'Cerrar aviso');
  cerrar.textContent = '✕';
  cerrar.addEventListener('click', () => {
    banner.remove();
  });

  acciones.append(recargar, exportar);
  banner.append(cuerpo, acciones, cerrar);
  document.body.append(banner);
}

let instalado = false;

/**
 * Instala los manejadores globales de error. Idempotente: llamarla más de una
 * vez no duplica listeners. No envía nada a la red.
 */
export function instalarErrorBoundary(): void {
  if (instalado || typeof window === 'undefined') {
    return;
  }
  instalado = true;

  window.addEventListener('error', (ev: ErrorEvent) => {
    const { mensaje, stack } = mensajeDeError(ev.error ?? ev.message);
    registrarLog('error', mensaje, stack);
    mostrarBanner();
  });

  window.addEventListener('unhandledrejection', (ev: PromiseRejectionEvent) => {
    const { mensaje, stack } = mensajeDeError(ev.reason);
    registrarLog('rechazo', mensaje, stack);
    mostrarBanner();
  });
}

/** Sólo para tests: restablece el estado de instalación. */
export function _resetErrorBoundary(): void {
  instalado = false;
}
