import type { Card } from '../../core/srs/fsrs';

/** Registro de un repaso, tal como vive en el store 'reviews'. */
export interface LogReview {
  id: string;
  tarjetaId: string;
  fecha: number;
  grado: 1 | 2 | 3 | 4;
  latenciaMs: number;
}

/** Tarjeta del store 'cards' (sólo necesitamos su estado FSRS aquí). */
export interface TarjetaConFsrs {
  fsrs: Card;
}

/** Un día del heatmap: fecha en formato ISO (YYYY-MM-DD) y nº de repasos. */
export interface DiaRepasos {
  fecha: string;
  total: number;
}

/** Reparto de tarjetas por nivel de dominio (derivado del estado/estabilidad FSRS). */
export interface Dominio {
  nuevas: number; // state New (0)
  aprendiendo: number; // state Learning/Relearning (1/3)
  jovenes: number; // state Review con estabilidad < UMBRAL_MADURA
  maduras: number; // state Review con estabilidad >= UMBRAL_MADURA
}

/** Resumen numérico para las tarjetas de cabecera. */
export interface ResumenEstadisticas {
  totalRepasos: number;
  aciertos: number;
  porcentajeAcierto: number; // 0..100, redondeado
  racha: number; // días consecutivos hasta hoy con >= 1 repaso
}

/** Estabilidad (en días) a partir de la cual consideramos una tarjeta "madura". */
export const UMBRAL_MADURA = 21;

const MS_POR_DIA = 24 * 60 * 60 * 1000;

/** Clave de día local (YYYY-MM-DD) para un instante en ms. */
export function claveDia(ms: number): string {
  const d = new Date(ms);
  const anio = d.getFullYear();
  const mes = `${d.getMonth() + 1}`.padStart(2, '0');
  const dia = `${d.getDate()}`.padStart(2, '0');
  return `${anio}-${mes}-${dia}`;
}

/** Clave de día local para un objeto Date (medianoche local). */
function claveDeFecha(d: Date): string {
  const anio = d.getFullYear();
  const mes = `${d.getMonth() + 1}`.padStart(2, '0');
  const dia = `${d.getDate()}`.padStart(2, '0');
  return `${anio}-${mes}-${dia}`;
}

/** Total de repasos registrados. */
export function totalRepasos(reviews: readonly LogReview[]): number {
  return reviews.length;
}

/** Porcentaje de aciertos (grado >= 3) sobre el total, 0..100 redondeado. */
export function porcentajeAcierto(reviews: readonly LogReview[]): number {
  if (reviews.length === 0) {
    return 0;
  }
  const aciertos = reviews.filter((r) => r.grado >= 3).length;
  return Math.round((aciertos / reviews.length) * 100);
}

/**
 * Racha de días consecutivos (terminando hoy o ayer) con al menos un repaso.
 * Si el último repaso no fue ni hoy ni ayer, la racha es 0.
 */
export function rachaActual(reviews: readonly LogReview[], ahora: Date): number {
  if (reviews.length === 0) {
    return 0;
  }
  const dias = new Set<string>();
  for (const r of reviews) {
    dias.add(claveDia(r.fecha));
  }

  const hoy = new Date(ahora.getFullYear(), ahora.getMonth(), ahora.getDate());
  // El ancla es hoy si hubo repaso hoy; si no, ayer (se tolera el día en curso aún vacío).
  let ancla = hoy;
  if (!dias.has(claveDeFecha(hoy))) {
    const ayer = new Date(hoy.getTime() - MS_POR_DIA);
    if (!dias.has(claveDeFecha(ayer))) {
      return 0;
    }
    ancla = ayer;
  }

  let racha = 0;
  let cursor = ancla;
  while (dias.has(claveDeFecha(cursor))) {
    racha += 1;
    cursor = new Date(cursor.getTime() - MS_POR_DIA);
  }
  return racha;
}

/**
 * Serie de repasos por día para el heatmap, cubriendo las últimas `semanas`
 * semanas completas (terminando hoy). Devuelve un día por cada fecha del rango,
 * en orden cronológico, rellenando con 0 los días sin repasos.
 */
export function repasosPorDia(
  reviews: readonly LogReview[],
  ahora: Date,
  semanas = 12,
): DiaRepasos[] {
  const conteo = new Map<string, number>();
  for (const r of reviews) {
    const clave = claveDia(r.fecha);
    conteo.set(clave, (conteo.get(clave) ?? 0) + 1);
  }

  const hoy = new Date(ahora.getFullYear(), ahora.getMonth(), ahora.getDate());
  // Alinear el final de la rejilla al sábado de esta semana (semana domingo..sábado).
  const finSemana = new Date(hoy.getTime() + (6 - hoy.getDay()) * MS_POR_DIA);
  const totalDias = semanas * 7;
  const inicio = new Date(finSemana.getTime() - (totalDias - 1) * MS_POR_DIA);

  const dias: DiaRepasos[] = [];
  for (let i = 0; i < totalDias; i += 1) {
    const fecha = new Date(inicio.getTime() + i * MS_POR_DIA);
    const clave = claveDeFecha(fecha);
    dias.push({ fecha: clave, total: conteo.get(clave) ?? 0 });
  }
  return dias;
}

/** Reparto de tarjetas por nivel de dominio según su estado FSRS. */
export function calcularDominio(cards: readonly TarjetaConFsrs[]): Dominio {
  const dominio: Dominio = { nuevas: 0, aprendiendo: 0, jovenes: 0, maduras: 0 };
  for (const c of cards) {
    const { stability } = c.fsrs;
    const state = Number(c.fsrs.state); // 0 New | 1 Learning | 2 Review | 3 Relearning
    if (state === 0) {
      dominio.nuevas += 1;
    } else if (state === 1 || state === 3) {
      dominio.aprendiendo += 1;
    } else if (stability >= UMBRAL_MADURA) {
      dominio.maduras += 1;
    } else {
      dominio.jovenes += 1;
    }
  }
  return dominio;
}

/** Resumen completo para la cabecera de la vista. */
export function resumenEstadisticas(
  reviews: readonly LogReview[],
  ahora: Date,
): ResumenEstadisticas {
  const total = totalRepasos(reviews);
  const aciertos = reviews.filter((r) => r.grado >= 3).length;
  return {
    totalRepasos: total,
    aciertos,
    porcentajeAcierto: porcentajeAcierto(reviews),
    racha: rachaActual(reviews, ahora),
  };
}

/**
 * Nivel de intensidad 0..4 de un día para el heatmap, escalado contra el
 * máximo de repasos en un día de la serie. 0 = sin repasos.
 */
export function nivelIntensidad(total: number, maximo: number): 0 | 1 | 2 | 3 | 4 {
  if (total <= 0) {
    return 0;
  }
  if (maximo <= 0) {
    return 1;
  }
  const ratio = total / maximo;
  if (ratio > 0.75) {
    return 4;
  }
  if (ratio > 0.5) {
    return 3;
  }
  if (ratio > 0.25) {
    return 2;
  }
  return 1;
}

/** Máximo de repasos en un solo día de la serie (para escalar el heatmap). */
export function maximoDiario(dias: readonly DiaRepasos[]): number {
  let max = 0;
  for (const d of dias) {
    if (d.total > max) {
      max = d.total;
    }
  }
  return max;
}
