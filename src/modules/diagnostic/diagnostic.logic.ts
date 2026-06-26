// Lógica pura del diagnóstico adaptativo (CAT simplificado por escalera).
// Sin DOM ni I/O: 100% testeable. La vista (index.ts) consume estas funciones.

import type { LexemaSemilla } from '../../types';

/** Un ítem de opción múltiple: del hanzi a su significado. */
export interface ItemDiagnostico {
  lexemaId: string;
  hanzi: string;
  pinyin: string;
  /** Significado correcto (es). */
  correcta: string;
  /** 4 opciones barajadas (incluye la correcta). */
  opciones: readonly string[];
  /** Nivel de dificultad del ítem (3..7). */
  dificultad: number;
}

/** Respuesta registrada del usuario a un ítem ya presentado. */
export interface RespuestaItem {
  lexemaId: string;
  dificultad: number;
  correcto: boolean;
  latenciaMs: number;
}

/** Estado del diagnóstico (inmutable: cada función devuelve uno nuevo). */
export interface EstadoDiagnostico {
  /** Banco completo agrupado por dificultad, ya barajado dentro de cada nivel. */
  banco: readonly ItemDiagnostico[];
  /** Nivel de dificultad actual de la escalera (3..7). */
  nivelActual: number;
  /** Ítems ya presentados (para no repetir). */
  presentados: readonly string[];
  /** Respuestas acumuladas. */
  respuestas: readonly RespuestaItem[];
  /** Nº de reversiones de dirección de la escalera (sube tras bajar o viceversa). */
  reversiones: number;
  /** Última dirección tomada: 1 subió, -1 bajó, 0 inicio. */
  ultimaDireccion: -1 | 0 | 1;
  /** Marcado true cuando ya no hay más ítems que presentar. */
  agotado: boolean;
}

export const NIVEL_MIN = 3;
export const NIVEL_MAX = 7;
export const NIVEL_INICIAL = 5;
/** Tras tantos ítems, paramos aunque no haya convergido. */
export const MAX_ITEMS = 15;
/** Mínimo de ítems antes de poder parar por convergencia. */
export const MIN_ITEMS = 12;
/** Reversiones alrededor del mismo nivel que detienen el test. */
export const REVERSIONES_PARA_PARAR = 2;
/** Umbral de acierto (por nivel) para considerar el nivel "dominado". */
export const UMBRAL_DOMINIO = 0.7;
/** Latencia (ms) por encima de la cual un acierto se considera "frágil" (lento). */
export const LATENCIA_FRAGIL_MS = 6000;

/** Generador determinista (mulberry32) para barajar de forma reproducible en tests. */
function rng(semilla: number): () => number {
  let a = semilla >>> 0;
  return () => {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function barajar<T>(arr: readonly T[], rand: () => number): T[] {
  const copia = [...arr];
  for (let i = copia.length - 1; i > 0; i--) {
    const j = Math.floor(rand() * (i + 1));
    const a = copia[i];
    const b = copia[j];
    if (a !== undefined && b !== undefined) {
      copia[i] = b;
      copia[j] = a;
    }
  }
  return copia;
}

function recortarNivel(nivel: number): number {
  return Math.max(NIVEL_MIN, Math.min(NIVEL_MAX, nivel));
}

/**
 * Construye el banco de ítems a partir de los lexemas. Cada ítem lleva 3
 * distractores de significado tomados (preferentemente) de lexemas de
 * dificultad similar. `semilla` hace el resultado reproducible.
 */
export function construirBanco(lexemas: readonly LexemaSemilla[], semilla = 1): ItemDiagnostico[] {
  const rand = rng(semilla);
  const items: ItemDiagnostico[] = [];

  for (const lexema of lexemas) {
    const candidatos = lexemas.filter((otro) => otro.id !== lexema.id && otro.es !== lexema.es);
    // Priorizar distractores de dificultad parecida; rellenar con el resto.
    const cercanos = candidatos.filter(
      (otro) => Math.abs(otro.dificultad - lexema.dificultad) <= 1,
    );
    const lejanos = candidatos.filter((otro) => Math.abs(otro.dificultad - lexema.dificultad) > 1);
    const orden = [...barajar(cercanos, rand), ...barajar(lejanos, rand)];

    const distractores: string[] = [];
    for (const cand of orden) {
      if (distractores.length >= 3) {
        break;
      }
      if (!distractores.includes(cand.es)) {
        distractores.push(cand.es);
      }
    }
    if (distractores.length < 3) {
      continue; // No hay material suficiente para un ítem válido.
    }

    const opciones = barajar([lexema.es, ...distractores], rand);
    items.push({
      lexemaId: lexema.id,
      hanzi: lexema.hanzi,
      pinyin: lexema.pinyin,
      correcta: lexema.es,
      opciones,
      dificultad: recortarNivel(lexema.dificultad),
    });
  }

  return items;
}

/** Crea el estado inicial. El banco ya debe venir construido (construirBanco). */
export function crearEstadoDiagnostico(banco: readonly ItemDiagnostico[]): EstadoDiagnostico {
  return {
    banco,
    nivelActual: NIVEL_INICIAL,
    presentados: [],
    respuestas: [],
    reversiones: 0,
    ultimaDireccion: 0,
    agotado: false,
  };
}

/**
 * Devuelve el siguiente ítem a presentar: el del nivel actual no presentado
 * más cercano (busca hacia fuera si el nivel exacto está agotado). undefined
 * si no queda ninguno.
 */
export function siguienteItem(estado: EstadoDiagnostico): ItemDiagnostico | undefined {
  const pendientes = estado.banco.filter((it) => !estado.presentados.includes(it.lexemaId));
  if (pendientes.length === 0) {
    return undefined;
  }
  let mejor: ItemDiagnostico | undefined;
  let mejorDist = Number.POSITIVE_INFINITY;
  for (const it of pendientes) {
    const dist = Math.abs(it.dificultad - estado.nivelActual);
    if (dist < mejorDist) {
      mejorDist = dist;
      mejor = it;
    }
  }
  return mejor;
}

/**
 * Registra la respuesta al ítem actual y ajusta la escalera:
 * acierto -> sube de nivel; fallo -> baja. Cuenta reversiones de dirección.
 */
export function responderItem(
  estado: EstadoDiagnostico,
  correcto: boolean,
  latenciaMs: number,
): EstadoDiagnostico {
  const item = siguienteItem(estado);
  if (!item) {
    return { ...estado, agotado: true };
  }

  const respuesta: RespuestaItem = {
    lexemaId: item.lexemaId,
    dificultad: item.dificultad,
    correcto,
    latenciaMs,
  };

  const direccion: -1 | 1 = correcto ? 1 : -1;
  const nuevoNivel = recortarNivel(estado.nivelActual + direccion);
  const huboReversion = estado.ultimaDireccion !== 0 && estado.ultimaDireccion !== direccion;

  const presentados = [...estado.presentados, item.lexemaId];
  const agotado = presentados.length >= estado.banco.length;

  return {
    ...estado,
    nivelActual: nuevoNivel,
    presentados,
    respuestas: [...estado.respuestas, respuesta],
    reversiones: estado.reversiones + (huboReversion ? 1 : 0),
    ultimaDireccion: direccion,
    agotado,
  };
}

/**
 * ¿Debe terminar el test? Para si: se agotó el banco, se alcanzó MAX_ITEMS,
 * o (con al menos MIN_ITEMS) hubo suficientes reversiones (convergió).
 */
export function estaCompleto(estado: EstadoDiagnostico): boolean {
  const n = estado.respuestas.length;
  if (estado.agotado || n >= MAX_ITEMS) {
    return true;
  }
  if (n >= MIN_ITEMS && estado.reversiones >= REVERSIONES_PARA_PARAR) {
    return true;
  }
  return false;
}

/** Acierto por nivel: { nivel -> {aciertos, total} }. */
function aciertosPorNivel(estado: EstadoDiagnostico): Map<number, { ok: number; total: number }> {
  const mapa = new Map<number, { ok: number; total: number }>();
  for (const r of estado.respuestas) {
    const prev = mapa.get(r.dificultad) ?? { ok: 0, total: 0 };
    mapa.set(r.dificultad, {
      ok: prev.ok + (r.correcto ? 1 : 0),
      total: prev.total + 1,
    });
  }
  return mapa;
}

/**
 * Estima el nivel HSK: el nivel más alto con >= UMBRAL_DOMINIO de acierto
 * (entre los niveles con al menos una respuesta). Si ninguno llega al umbral,
 * devuelve el más bajo evaluado. Si no hay respuestas, NIVEL_MIN.
 */
export function estimarNivel(estado: EstadoDiagnostico): number {
  const mapa = aciertosPorNivel(estado);
  if (mapa.size === 0) {
    return NIVEL_MIN;
  }
  const niveles = [...mapa.keys()].sort((a, b) => a - b);
  let estimado: number | undefined;
  for (const nivel of niveles) {
    const datos = mapa.get(nivel);
    if (datos && datos.total > 0 && datos.ok / datos.total >= UMBRAL_DOMINIO) {
      estimado = nivel; // nos quedamos con el más alto que cumpla
    }
  }
  if (estimado !== undefined) {
    return estimado;
  }
  const primero = niveles[0];
  return primero ?? NIVEL_MIN;
}

/** Resumen agregado del diagnóstico, listo para mostrar y persistir. */
export interface ResumenDiagnostico {
  nivelHsk: number;
  totalItems: number;
  aciertos: number;
  porcentaje: number;
  /** Latencia media de los aciertos (ms); 0 si no hubo aciertos. */
  latenciaMediaMs: number;
}

export function resumir(estado: EstadoDiagnostico): ResumenDiagnostico {
  const total = estado.respuestas.length;
  const aciertosArr = estado.respuestas.filter((r) => r.correcto);
  const aciertos = aciertosArr.length;
  const sumaLat = aciertosArr.reduce((s, r) => s + r.latenciaMs, 0);
  return {
    nivelHsk: estimarNivel(estado),
    totalItems: total,
    aciertos,
    porcentaje: total > 0 ? Math.round((aciertos / total) * 100) : 0,
    latenciaMediaMs: aciertos > 0 ? Math.round(sumaLat / aciertos) : 0,
  };
}
