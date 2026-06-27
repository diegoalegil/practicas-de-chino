// Reactivación: tras el diagnóstico, sembramos el SRS con las palabras que el
// usuario YA reconoce, saltándonos el "valle del reaprendizaje". En vez de
// crearlas como nuevas (estabilidad mínima), les damos una estabilidad inicial
// alta (3..7 días) en estado Review. Cuanto más rápida fue la respuesta, más
// estable la consideramos.
//
// Ahora es MULTI-SKILL: según la habilidad acertada sembramos el tipo de tarjeta
// adecuado (vocab -> recognition, escritura -> production, escucha -> listening).
// La lectura no tiene lexema asociado, así que no siembra tarjetas.

import { State, type Card } from 'ts-fsrs';
import { nuevaTarjeta } from '../../core/srs/fsrs';
import { get, put } from '../../core/storage';
import type { TipoTarjeta } from '../../types';
import type { TarjetaUsuario } from '../vocab/types';
import type { Habilidad, RespuestaItem } from './diagnostic.logic';
import { LATENCIA_FRAGIL_MS } from './diagnostic.logic';

const STORE = 'cards';
const DIA_MS = 86_400_000;

/** Mínimo y máximo de días de estabilidad inicial para una reactivación. */
export const DIAS_MIN = 3;
export const DIAS_MAX = 7;

/** Habilidad acertada -> tipo de tarjeta SRS a sembrar. `undefined` = no sembrar. */
export function tipoPorHabilidad(habilidad: Habilidad): TipoTarjeta | undefined {
  switch (habilidad) {
    case 'vocab':
      return 'recognition';
    case 'escritura':
      return 'production';
    case 'escucha':
      return 'listening';
    case 'lectura':
      return undefined; // sin lexema concreto: no se reactiva como tarjeta
  }
}

/**
 * Mapea la latencia de un acierto a días de estabilidad inicial:
 * respuesta instantánea -> DIAS_MAX (memoria sólida), respuesta lenta
 * (>= LATENCIA_FRAGIL_MS) -> DIAS_MIN (memoria frágil, repasar antes).
 */
export function diasPorLatencia(latenciaMs: number): number {
  const clamp = Math.max(0, Math.min(LATENCIA_FRAGIL_MS, latenciaMs));
  const fraccion = 1 - clamp / LATENCIA_FRAGIL_MS; // 1 rápido .. 0 lento
  const dias = DIAS_MIN + fraccion * (DIAS_MAX - DIAS_MIN);
  return Math.round(dias);
}

/**
 * Construye un Card "reactivado" en estado Review: parte de una tarjeta nueva y
 * sobreescribe estabilidad/vencimiento para reflejar que ya se sabe. Conserva
 * `learning_steps` de la tarjeta base (campo requerido por el Card de ts-fsrs).
 */
export function construirCardReactivado(latenciaMs: number, ahora: Date): Card {
  const dias = diasPorLatencia(latenciaMs);
  const base = nuevaTarjeta(ahora);
  return {
    ...base,
    stability: dias,
    difficulty: base.difficulty,
    scheduled_days: dias,
    elapsed_days: 0,
    reps: 1,
    lapses: 0,
    state: State.Review,
    last_review: ahora,
    due: new Date(ahora.getTime() + dias * DIA_MS),
  };
}

/** Construye la TarjetaUsuario reactivada de un lexema para un tipo concreto. */
export function construirTarjetaReactivada(
  lexemaId: string,
  tipo: TipoTarjeta,
  latenciaMs: number,
  ahora: Date,
): TarjetaUsuario {
  return {
    id: `${lexemaId}:${tipo}`,
    lexemaId,
    tipo,
    origen: 'reactivacion',
    fsrs: construirCardReactivado(latenciaMs, ahora),
  };
}

/**
 * Siembra el SRS a partir de las respuestas ACERTADAS del diagnóstico, según su
 * habilidad:
 *  - vocab -> recognition, escritura -> production, escucha -> listening.
 *  - lectura no tiene lexema concreto: se ignora.
 *  - Solo aciertos: lo que falló se aprenderá como nuevo.
 *  - Idempotente: si ya existe una tarjeta de ese tipo con estabilidad >= la
 *    propuesta, NO se degrada (no pisar progreso real).
 * Devuelve cuántas tarjetas se sembraron/actualizaron.
 */
export async function sembrarReactivacion(
  respuestas: readonly RespuestaItem[],
  ahora: Date,
): Promise<number> {
  let sembradas = 0;
  for (const r of respuestas) {
    if (!r.correcto || r.lexemaId === '') {
      continue;
    }
    const tipo = tipoPorHabilidad(r.habilidad);
    if (!tipo) {
      continue;
    }
    const id = `${r.lexemaId}:${tipo}`;
    const nueva = construirTarjetaReactivada(r.lexemaId, tipo, r.latenciaMs, ahora);
    const existente = await get<TarjetaUsuario>(STORE, id);
    if (existente && existente.fsrs.stability >= nueva.fsrs.stability) {
      continue; // No degradar memoria ya consolidada.
    }
    await put(STORE, nueva);
    sembradas += 1;
  }
  return sembradas;
}
