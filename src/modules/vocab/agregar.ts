// Añade un lexema al SRS bajo demanda (p. ej. desde el lector de lectura).
// Reutiliza nuevaTarjeta (FSRS) + la capa de persistencia, sin reinventar nada.

import { get, put } from '../../core/storage';
import { nuevaTarjeta } from '../../core/srs/fsrs';
import type { TarjetaUsuario } from './types';

const STORE = 'cards';

/** Clave canónica de la tarjeta de reconocimiento de un lexema. */
export function idTarjetaReconocimiento(lexemaId: string): string {
  return `${lexemaId}:recognition`;
}

/**
 * Crea (si aún no existe) la tarjeta `recognition` del lexema indicado y la
 * persiste. Es idempotente: si la tarjeta ya está en el store, no la sobrescribe
 * para no perder el estado FSRS acumulado. Devuelve true si creó una tarjeta nueva.
 */
export async function agregarLexemaAlSrs(lexemaId: string, ahora: Date): Promise<boolean> {
  const id = idTarjetaReconocimiento(lexemaId);
  const existente = await get<TarjetaUsuario>(STORE, id);
  if (existente) {
    return false;
  }
  const tarjeta: TarjetaUsuario = {
    id,
    lexemaId,
    tipo: 'recognition',
    origen: 'nuevo',
    fsrs: nuevaTarjeta(ahora),
  };
  await put<TarjetaUsuario>(STORE, tarjeta);
  return true;
}
