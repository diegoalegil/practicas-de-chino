import { getAll, put, putAll } from '../../core/storage';
import { estaVencida, nuevaTarjeta, repasar } from '../../core/srs/fsrs';
import { LEXEMAS } from '../../content';
import type { GradoFsrs } from '../../types';
import type { LogReview, TarjetaUsuario } from './types';

const STORE = 'cards';
const REVIEWS = 'reviews';

/** Crea las tarjetas de reconocimiento la primera vez (idempotente). */
export async function asegurarTarjetas(ahora: Date): Promise<void> {
  const existentes = await getAll<TarjetaUsuario>(STORE);
  if (existentes.length > 0) {
    return;
  }
  const nuevas: TarjetaUsuario[] = LEXEMAS.map((lexema) => ({
    id: `${lexema.id}:recognition`,
    lexemaId: lexema.id,
    tipo: 'recognition',
    origen: 'nuevo',
    fsrs: nuevaTarjeta(ahora),
  }));
  await putAll(STORE, nuevas);
}

export async function todasLasTarjetas(): Promise<TarjetaUsuario[]> {
  return getAll<TarjetaUsuario>(STORE);
}

export async function tarjetasVencidas(ahora: Date): Promise<TarjetaUsuario[]> {
  const todas = await getAll<TarjetaUsuario>(STORE);
  return todas
    .filter((t) => estaVencida(t.fsrs, ahora))
    .sort((a, b) => new Date(a.fsrs.due).getTime() - new Date(b.fsrs.due).getTime());
}

/** Aplica el repaso a FSRS, persiste la tarjeta y registra el review. */
export async function registrarRepaso(
  tarjeta: TarjetaUsuario,
  grado: GradoFsrs,
  ahora: Date,
  latenciaMs = 0,
): Promise<TarjetaUsuario> {
  const actualizada: TarjetaUsuario = { ...tarjeta, fsrs: repasar(tarjeta.fsrs, grado, ahora) };
  await put(STORE, actualizada);
  const log: LogReview = {
    id: `${tarjeta.id}@${String(ahora.getTime())}`,
    tarjetaId: tarjeta.id,
    fecha: ahora.getTime(),
    grado,
    latenciaMs,
  };
  await put(REVIEWS, log);
  return actualizada;
}
