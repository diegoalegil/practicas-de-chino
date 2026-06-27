// Lógica pura del diagnóstico adaptativo MULTI-SKILL (CAT simplificado por escalera).
// Sin DOM ni I/O: 100% testeable. La vista (index.ts) consume estas funciones.
//
// Mide 4 habilidades repartiendo ítems de forma intercalada y manteniendo una
// única escalera de dificultad compartida (sube con aciertos, baja con fallos),
// pero acumulando aciertos/latencia POR habilidad para perfilar al usuario.

import type { LexemaSemilla } from '../../types';
import type { TextoLectura } from '../reading/reader.logic';

/** Las cuatro habilidades que mide el diagnóstico. */
export type Habilidad = 'vocab' | 'lectura' | 'escucha' | 'escritura';

/** Orden canónico de habilidades (para iterar y para intercalar de forma estable). */
export const HABILIDADES: readonly Habilidad[] = ['vocab', 'lectura', 'escucha', 'escritura'];

/**
 * Un ítem de opción múltiple. El significado de cada campo depende de la
 * habilidad, pero la forma es común (4 opciones de texto, una correcta):
 *  - vocab:     `prompt` = hanzi;   opciones = significados (es).
 *  - lectura:   `prompt` = frase + pregunta; opciones = respuestas.
 *  - escucha:   `prompt` = (se lee en voz alta `audio`); opciones = hanzi.
 *  - escritura: `prompt` = significado/pinyin; opciones = hanzi.
 */
export interface ItemDiagnostico {
  /** Habilidad que evalúa este ítem. */
  habilidad: Habilidad;
  /** Id estable y único del ítem (no se repite). */
  id: string;
  /** Lexema asociado (para reactivación). Vacío en ítems de lectura. */
  lexemaId: string;
  /** Texto del enunciado/estímulo principal (hanzi, frase + pregunta, etc.). */
  prompt: string;
  /** Lectura/pinyin auxiliar a mostrar tras responder. */
  pinyin: string;
  /** Texto que debe pronunciar el botón "Reproducir" en ítems de escucha. */
  audio?: string;
  /** Opción correcta (presente en `opciones`). */
  correcta: string;
  /** 4 opciones barajadas (incluye la correcta). */
  opciones: readonly string[];
  /** Nivel de dificultad del ítem (3..7). */
  dificultad: number;
}

/** Respuesta registrada del usuario a un ítem ya presentado. */
export interface RespuestaItem {
  habilidad: Habilidad;
  itemId: string;
  lexemaId: string;
  dificultad: number;
  correcto: boolean;
  latenciaMs: number;
}

/** Estado del diagnóstico (inmutable: cada función devuelve uno nuevo). */
export interface EstadoDiagnostico {
  /** Banco completo de ítems, ya intercalado por habilidad. */
  banco: readonly ItemDiagnostico[];
  /** Nivel de dificultad actual de la escalera (3..7). */
  nivelActual: number;
  /** Ids de ítems ya presentados (para no repetir). */
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
/** Ítems objetivo por habilidad (4 habilidades -> 12..16 ítems). */
export const ITEMS_POR_HABILIDAD = 4;
/** Tras tantos ítems, paramos aunque no haya convergido. */
export const MAX_ITEMS = ITEMS_POR_HABILIDAD * 4; // 16
/** Mínimo de ítems antes de poder parar por convergencia. */
export const MIN_ITEMS = 12;
/** Reversiones que, con suficientes ítems, detienen el test. */
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

/** Reúne hasta `n` distractores únicos de una lista candidata, evitando `evitar`. */
function tomarDistractores(orden: readonly string[], evitar: string, n: number): string[] {
  const out: string[] = [];
  for (const cand of orden) {
    if (out.length >= n) {
      break;
    }
    if (cand !== evitar && !out.includes(cand)) {
      out.push(cand);
    }
  }
  return out;
}

/** Mide la "cercanía ortográfica" de dos hanzi: caracteres compartidos. */
function comparteCaracter(a: string, b: string): boolean {
  for (const c of a) {
    if (b.includes(c)) {
      return true;
    }
  }
  return false;
}

/** Construye los ítems de VOCAB (hanzi -> significado). */
function itemsVocab(lexemas: readonly LexemaSemilla[], rand: () => number): ItemDiagnostico[] {
  const items: ItemDiagnostico[] = [];
  for (const lexema of lexemas) {
    const candidatos = lexemas.filter((o) => o.id !== lexema.id && o.es !== lexema.es);
    const cercanos = candidatos.filter((o) => Math.abs(o.dificultad - lexema.dificultad) <= 1);
    const lejanos = candidatos.filter((o) => Math.abs(o.dificultad - lexema.dificultad) > 1);
    const orden = [...barajar(cercanos, rand), ...barajar(lejanos, rand)].map((o) => o.es);
    const distractores = tomarDistractores(orden, lexema.es, 3);
    if (distractores.length < 3) {
      continue;
    }
    const opciones = barajar([lexema.es, ...distractores], rand);
    items.push({
      habilidad: 'vocab',
      id: `vocab:${lexema.id}`,
      lexemaId: lexema.id,
      prompt: lexema.hanzi,
      pinyin: lexema.pinyin,
      correcta: lexema.es,
      opciones,
      dificultad: recortarNivel(lexema.dificultad),
    });
  }
  return items;
}

/**
 * Construye los ítems de ESCRITURA (reconocimiento de la forma): dado el
 * significado y el pinyin, elegir el hanzi correcto entre 4. Los distractores
 * se prefieren ortográficamente próximos (comparten algún carácter) para que el
 * ítem mida la forma y no el mero significado.
 */
function itemsEscritura(lexemas: readonly LexemaSemilla[], rand: () => number): ItemDiagnostico[] {
  const items: ItemDiagnostico[] = [];
  for (const lexema of lexemas) {
    const candidatos = lexemas.filter((o) => o.id !== lexema.id && o.hanzi !== lexema.hanzi);
    const proximos = candidatos.filter((o) => comparteCaracter(o.hanzi, lexema.hanzi));
    const resto = candidatos.filter((o) => !comparteCaracter(o.hanzi, lexema.hanzi));
    const orden = [...barajar(proximos, rand), ...barajar(resto, rand)].map((o) => o.hanzi);
    const distractores = tomarDistractores(orden, lexema.hanzi, 3);
    if (distractores.length < 3) {
      continue;
    }
    const opciones = barajar([lexema.hanzi, ...distractores], rand);
    items.push({
      habilidad: 'escritura',
      id: `escritura:${lexema.id}`,
      lexemaId: lexema.id,
      prompt: `${lexema.es} · ${lexema.pinyin}`,
      pinyin: lexema.pinyin,
      correcta: lexema.hanzi,
      opciones,
      dificultad: recortarNivel(lexema.dificultad),
    });
  }
  return items;
}

/**
 * Construye los ítems de ESCUCHA (audio -> hanzi). El estímulo se pronuncia con
 * el campo `audio`; las opciones son hanzi. Distractores cercanos en dificultad.
 */
function itemsEscucha(lexemas: readonly LexemaSemilla[], rand: () => number): ItemDiagnostico[] {
  const items: ItemDiagnostico[] = [];
  for (const lexema of lexemas) {
    const candidatos = lexemas.filter((o) => o.id !== lexema.id && o.hanzi !== lexema.hanzi);
    const cercanos = candidatos.filter((o) => Math.abs(o.dificultad - lexema.dificultad) <= 1);
    const lejanos = candidatos.filter((o) => Math.abs(o.dificultad - lexema.dificultad) > 1);
    const orden = [...barajar(cercanos, rand), ...barajar(lejanos, rand)].map((o) => o.hanzi);
    const distractores = tomarDistractores(orden, lexema.hanzi, 3);
    if (distractores.length < 3) {
      continue;
    }
    const opciones = barajar([lexema.hanzi, ...distractores], rand);
    items.push({
      habilidad: 'escucha',
      id: `escucha:${lexema.id}`,
      lexemaId: lexema.id,
      prompt: lexema.es,
      pinyin: lexema.pinyin,
      audio: lexema.hanzi,
      correcta: lexema.hanzi,
      opciones,
      dificultad: recortarNivel(lexema.dificultad),
    });
  }
  return items;
}

/** Asigna una dificultad (3..7) a un texto según su nivel de lectura. */
function dificultadTexto(nivel: TextoLectura['nivel']): number {
  switch (nivel) {
    case 'intermedio':
      return 4;
    case 'intermedio-alto':
      return 5;
    case 'avanzado':
      return 6;
  }
}

/**
 * Extrae una frase corta (la primera, hasta el primer signo de cierre) del cuerpo
 * de un texto, como contexto para una pregunta de comprensión.
 */
function fraseContexto(cuerpo: string): string {
  const caracteres = [...cuerpo];
  let frase = '';
  for (const c of caracteres) {
    frase += c;
    if (c === '。' || c === '！' || c === '？') {
      break;
    }
    if ([...frase].length >= 40) {
      break;
    }
  }
  return frase.trim();
}

/**
 * Construye los ítems de LECTURA a partir de TEXTOS reales: una frase corta del
 * cuerpo como contexto + una pregunta de comprensión real con sus 4 opciones.
 */
function itemsLectura(textos: readonly TextoLectura[]): ItemDiagnostico[] {
  const items: ItemDiagnostico[] = [];
  for (const texto of textos) {
    const pregunta = texto.preguntas[0];
    if (!pregunta || pregunta.opciones.length < 4) {
      continue;
    }
    const correcta = pregunta.opciones[pregunta.correcta];
    if (correcta === undefined) {
      continue;
    }
    const contexto = fraseContexto(texto.cuerpo);
    items.push({
      habilidad: 'lectura',
      id: `lectura:${texto.id}`,
      lexemaId: '',
      prompt: `${contexto}\n\n${pregunta.enunciado}`,
      pinyin: texto.titulo,
      // Mantener el orden original de opciones: la corrección compara por texto.
      correcta,
      opciones: [...pregunta.opciones],
      dificultad: recortarNivel(dificultadTexto(texto.nivel)),
    });
  }
  return items;
}

/**
 * Intercala listas de ítems por habilidad en ronda robin estable: vocab, lectura,
 * escucha, escritura, vocab, ... hasta agotar (respetando el límite por habilidad).
 */
function intercalar(porHabilidad: Map<Habilidad, ItemDiagnostico[]>): ItemDiagnostico[] {
  const out: ItemDiagnostico[] = [];
  let quedan = true;
  let ronda = 0;
  while (quedan) {
    quedan = false;
    for (const h of HABILIDADES) {
      const lista = porHabilidad.get(h);
      if (lista && ronda < lista.length) {
        const item = lista[ronda];
        if (item) {
          out.push(item);
        }
        if (ronda + 1 < lista.length) {
          quedan = true;
        }
      }
    }
    ronda += 1;
  }
  return out;
}

/** Parámetros de entrada para construir el banco multi-skill. */
export interface FuentesBanco {
  lexemas: readonly LexemaSemilla[];
  textos: readonly TextoLectura[];
}

/**
 * Construye el banco multi-skill de forma determinista (orden estable + `semilla`
 * para el barajado de distractores). Toma hasta `ITEMS_POR_HABILIDAD` ítems de
 * cada habilidad y los intercala. Lectura usa todos los textos disponibles.
 */
export function construirBanco(fuentes: FuentesBanco, semilla = 1): ItemDiagnostico[] {
  const rand = rng(semilla);
  // Construir por habilidad y recortar a la cuota.
  const recorta = (xs: ItemDiagnostico[]): ItemDiagnostico[] => xs.slice(0, ITEMS_POR_HABILIDAD);
  const porHabilidad = new Map<Habilidad, ItemDiagnostico[]>([
    ['vocab', recorta(itemsVocab(fuentes.lexemas, rand))],
    ['escritura', recorta(itemsEscritura(fuentes.lexemas, rand))],
    ['escucha', recorta(itemsEscucha(fuentes.lexemas, rand))],
    // Lectura suele tener menos material: tomamos los que haya (hasta la cuota).
    ['lectura', recorta(itemsLectura(fuentes.textos))],
  ]);
  return intercalar(porHabilidad);
}

/** Crea el estado inicial. El banco ya debe venir construido (construirBanco). */
export function crearEstado(banco: readonly ItemDiagnostico[]): EstadoDiagnostico {
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

/** Alias retrocompatible. */
export const crearEstadoDiagnostico = crearEstado;

/**
 * Siguiente ítem a presentar. Prioriza:
 *  1) la habilidad menos evaluada hasta ahora (para repartir parejo),
 *  2) dentro de ella, el ítem de dificultad más cercana al nivel actual.
 * Si la habilidad menos evaluada no tiene pendientes, considera el resto.
 */
export function siguienteItem(estado: EstadoDiagnostico): ItemDiagnostico | undefined {
  const pendientes = estado.banco.filter((it) => !estado.presentados.includes(it.id));
  if (pendientes.length === 0) {
    return undefined;
  }
  // Conteo de respuestas por habilidad.
  const conteo = new Map<Habilidad, number>();
  for (const h of HABILIDADES) {
    conteo.set(h, 0);
  }
  for (const r of estado.respuestas) {
    conteo.set(r.habilidad, (conteo.get(r.habilidad) ?? 0) + 1);
  }

  let mejor: ItemDiagnostico | undefined;
  let mejorClave = Number.POSITIVE_INFINITY;
  for (const it of pendientes) {
    const evaluadas = conteo.get(it.habilidad) ?? 0;
    const distNivel = Math.abs(it.dificultad - estado.nivelActual);
    // Clave compuesta: primero menos evaluadas, luego más cerca del nivel.
    const clave = evaluadas * 100 + distNivel;
    if (clave < mejorClave) {
      mejorClave = clave;
      mejor = it;
    }
  }
  return mejor;
}

/**
 * Registra la respuesta al ítem actual y ajusta la escalera (compartida entre
 * habilidades): acierto -> sube de nivel; fallo -> baja. Cuenta reversiones.
 */
export function responder(
  estado: EstadoDiagnostico,
  correcto: boolean,
  latenciaMs: number,
): EstadoDiagnostico {
  const item = siguienteItem(estado);
  if (!item) {
    return { ...estado, agotado: true };
  }

  const respuesta: RespuestaItem = {
    habilidad: item.habilidad,
    itemId: item.id,
    lexemaId: item.lexemaId,
    dificultad: item.dificultad,
    correcto,
    latenciaMs,
  };

  const direccion: -1 | 1 = correcto ? 1 : -1;
  const nuevoNivel = recortarNivel(estado.nivelActual + direccion);
  const huboReversion = estado.ultimaDireccion !== 0 && estado.ultimaDireccion !== direccion;

  const presentados = [...estado.presentados, item.id];
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

/** Alias retrocompatible. */
export const responderItem = responder;

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

/** Perfil de una habilidad: nivel estimado + aciertos / total. */
export interface PerfilHabilidad {
  nivel: number;
  aciertos: number;
  total: number;
}

/** Acierto por nivel para un subconjunto de respuestas: { nivel -> {ok,total} }. */
function aciertosPorNivel(
  respuestas: readonly RespuestaItem[],
): Map<number, { ok: number; total: number }> {
  const mapa = new Map<number, { ok: number; total: number }>();
  for (const r of respuestas) {
    const prev = mapa.get(r.dificultad) ?? { ok: 0, total: 0 };
    mapa.set(r.dificultad, { ok: prev.ok + (r.correcto ? 1 : 0), total: prev.total + 1 });
  }
  return mapa;
}

/**
 * Estima el nivel a partir de un conjunto de respuestas: el nivel más alto con
 * >= UMBRAL_DOMINIO de acierto; si ninguno llega, el más bajo evaluado; si no
 * hay respuestas, NIVEL_MIN. Nunca divide por cero (comprueba total > 0).
 */
export function estimarNivelDe(respuestas: readonly RespuestaItem[]): number {
  const mapa = aciertosPorNivel(respuestas);
  if (mapa.size === 0) {
    return NIVEL_MIN;
  }
  const niveles = [...mapa.keys()].sort((a, b) => a - b);
  let estimado: number | undefined;
  for (const nivel of niveles) {
    const datos = mapa.get(nivel);
    if (datos && datos.total > 0 && datos.ok / datos.total >= UMBRAL_DOMINIO) {
      estimado = nivel;
    }
  }
  return estimado ?? niveles[0] ?? NIVEL_MIN;
}

/** Compat: estima el nivel global a partir de TODAS las respuestas del estado. */
export function estimarNivel(estado: EstadoDiagnostico): number {
  return estimarNivelDe(estado.respuestas);
}

/**
 * Perfil por habilidad: para cada una de las 4 habilidades, nivel estimado y
 * recuento de aciertos/total. Siempre devuelve las 4 claves (total 0 si no se
 * evaluó), de modo que el radar pueda dibujarse sin huecos. Sin div/0.
 */
export function perfilPorHabilidad(estado: EstadoDiagnostico): Record<Habilidad, PerfilHabilidad> {
  const out = {} as Record<Habilidad, PerfilHabilidad>;
  for (const h of HABILIDADES) {
    const resp = estado.respuestas.filter((r) => r.habilidad === h);
    const aciertos = resp.filter((r) => r.correcto).length;
    out[h] = {
      nivel: estimarNivelDe(resp),
      aciertos,
      total: resp.length,
    };
  }
  return out;
}

/**
 * Nivel global: media de los niveles de las habilidades que SÍ se evaluaron
 * (total > 0), redondeada y recortada al rango. Si ninguna se evaluó, NIVEL_MIN.
 * Nunca divide por cero.
 */
export function nivelGlobal(estado: EstadoDiagnostico): number {
  const perfil = perfilPorHabilidad(estado);
  const evaluadas = HABILIDADES.map((h) => perfil[h]).filter((p) => p.total > 0);
  if (evaluadas.length === 0) {
    return NIVEL_MIN;
  }
  const suma = evaluadas.reduce((s, p) => s + p.nivel, 0);
  return recortarNivel(Math.round(suma / evaluadas.length));
}

/** Resumen agregado del diagnóstico, listo para mostrar y persistir. */
export interface ResumenDiagnostico {
  nivelHsk: number;
  totalItems: number;
  aciertos: number;
  porcentaje: number;
  /** Latencia media de los aciertos (ms); 0 si no hubo aciertos. */
  latenciaMediaMs: number;
  /** Perfil por habilidad para el radar. */
  perfil: Record<Habilidad, PerfilHabilidad>;
}

export function resumir(estado: EstadoDiagnostico): ResumenDiagnostico {
  const total = estado.respuestas.length;
  const aciertosArr = estado.respuestas.filter((r) => r.correcto);
  const aciertos = aciertosArr.length;
  const sumaLat = aciertosArr.reduce((s, r) => s + r.latenciaMs, 0);
  return {
    nivelHsk: nivelGlobal(estado),
    totalItems: total,
    aciertos,
    porcentaje: total > 0 ? Math.round((aciertos / total) * 100) : 0,
    latenciaMediaMs: aciertos > 0 ? Math.round(sumaLat / aciertos) : 0,
    perfil: perfilPorHabilidad(estado),
  };
}
