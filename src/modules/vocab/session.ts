import type { GradoFsrs } from '../../types';
import type { TarjetaUsuario } from './types';

/** Estado puro de una sesión de repaso (sin DOM ni persistencia). */
export interface EstadoSesion {
  cola: TarjetaUsuario[];
  indice: number;
  revelada: boolean;
  completadas: number;
  aciertos: number;
}

export function iniciarSesion(cola: readonly TarjetaUsuario[]): EstadoSesion {
  return { cola: [...cola], indice: 0, revelada: false, completadas: 0, aciertos: 0 };
}

export function tarjetaActual(estado: EstadoSesion): TarjetaUsuario | undefined {
  return estado.cola[estado.indice];
}

export function terminada(estado: EstadoSesion): boolean {
  return estado.indice >= estado.cola.length;
}

export function revelar(estado: EstadoSesion): EstadoSesion {
  return { ...estado, revelada: true };
}

/**
 * Registra la respuesta y avanza. Un "Otra vez" (grado 1) re-encola la tarjeta
 * al final para repetirla dentro de la misma sesión (interleaving ligero).
 */
export function responder(estado: EstadoSesion, grado: GradoFsrs): EstadoSesion {
  const actual = tarjetaActual(estado);
  if (!actual) {
    return estado;
  }
  const cola = [...estado.cola];
  if (grado === 1) {
    cola.push(actual);
  }
  return {
    ...estado,
    cola,
    indice: estado.indice + 1,
    revelada: false,
    completadas: estado.completadas + 1,
    aciertos: estado.aciertos + (grado >= 3 ? 1 : 0),
  };
}
