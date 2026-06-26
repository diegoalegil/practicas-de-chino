// Lógica pura del módulo de escucha y dictado (sin DOM, testeable con Vitest).

import type { LexemaSemilla } from '../../types';

/** Los cuatro tonos del mandarín (el tono neutro se ignora en este ejercicio). */
export type Tono = 1 | 2 | 3 | 4;

/** Una sílaba de banco para el ejercicio de tonos (par mínimo y similares). */
export interface SilabaTono {
  pinyin: string; // con marca tonal, p.ej. 'mā'
  base: string; // sin tono, p.ej. 'ma'
  hanzi: string; // carácter que la representa
  tono: Tono;
  es: string; // glosa breve en español
}

/** Máximo de caracteres hanzi admitidos en un ítem de dictado (chengyu = 4). */
const MAX_HANZI_DICTADO = 4;

/**
 * Banco de sílabas para el ejercicio de identificación de tonos.
 * Incluye el par mínimo clásico mā/má/mǎ/mà y otras sílabas frecuentes.
 */
export const BANCO_TONOS: readonly SilabaTono[] = [
  { pinyin: 'mā', base: 'ma', hanzi: '妈', tono: 1, es: 'madre' },
  { pinyin: 'má', base: 'ma', hanzi: '麻', tono: 2, es: 'cáñamo' },
  { pinyin: 'mǎ', base: 'ma', hanzi: '马', tono: 3, es: 'caballo' },
  { pinyin: 'mà', base: 'ma', hanzi: '骂', tono: 4, es: 'regañar' },
  { pinyin: 'mēn', base: 'men', hanzi: '闷', tono: 1, es: 'sofocante' },
  { pinyin: 'mén', base: 'men', hanzi: '门', tono: 2, es: 'puerta' },
  { pinyin: 'tāng', base: 'tang', hanzi: '汤', tono: 1, es: 'sopa' },
  { pinyin: 'táng', base: 'tang', hanzi: '糖', tono: 2, es: 'azúcar' },
  { pinyin: 'tǎng', base: 'tang', hanzi: '躺', tono: 3, es: 'tumbarse' },
  { pinyin: 'tàng', base: 'tang', hanzi: '烫', tono: 4, es: 'hirviendo' },
  { pinyin: 'shū', base: 'shu', hanzi: '书', tono: 1, es: 'libro' },
  { pinyin: 'shú', base: 'shu', hanzi: '熟', tono: 2, es: 'maduro' },
  { pinyin: 'shǔ', base: 'shu', hanzi: '鼠', tono: 3, es: 'ratón' },
  { pinyin: 'shù', base: 'shu', hanzi: '树', tono: 4, es: 'árbol' },
  { pinyin: 'bēi', base: 'bei', hanzi: '杯', tono: 1, es: 'vaso' },
  { pinyin: 'běi', base: 'bei', hanzi: '北', tono: 3, es: 'norte' },
  { pinyin: 'bèi', base: 'bei', hanzi: '被', tono: 4, es: 'manta' },
  { pinyin: 'wèn', base: 'wen', hanzi: '问', tono: 4, es: 'preguntar' },
  { pinyin: 'wén', base: 'wen', hanzi: '文', tono: 2, es: 'lengua' },
  { pinyin: 'wěn', base: 'wen', hanzi: '吻', tono: 3, es: 'beso' },
];

const MAPA_TONOS: Readonly<Record<string, string>> = {
  ā: 'a',
  á: 'a',
  ǎ: 'a',
  à: 'a',
  ē: 'e',
  é: 'e',
  ě: 'e',
  è: 'e',
  ī: 'i',
  í: 'i',
  ǐ: 'i',
  ì: 'i',
  ō: 'o',
  ó: 'o',
  ǒ: 'o',
  ò: 'o',
  ū: 'u',
  ú: 'u',
  ǔ: 'u',
  ù: 'u',
  ü: 'u',
  ǘ: 'u',
  ǚ: 'u',
  ǜ: 'u',
  ǖ: 'u',
};

/**
 * Normaliza una cadena de pinyin para comparar: minúsculas, sin marcas tonales,
 * 'ü'/'v' -> 'u', y sin espacios ni signos de separación.
 */
export function normalizarPinyin(entrada: string): string {
  const minuscula = entrada.normalize('NFC').trim().toLowerCase();
  let salida = '';
  for (const caracter of minuscula) {
    const reemplazo = MAPA_TONOS[caracter];
    salida += reemplazo ?? caracter;
  }
  // 'v' es el atajo común de teclado para 'ü'.
  salida = salida.replace(/v/g, 'u');
  // Quita todo lo que no sea letra latina (espacios, apóstrofos, guiones, números).
  return salida.replace(/[^a-z]/g, '');
}

/**
 * Compara la respuesta de pinyin de la usuaria contra el pinyin correcto,
 * ignorando tonos, mayúsculas, espacios y signos de separación.
 */
export function pinyinCoincide(respuesta: string, correcto: string): boolean {
  const r = normalizarPinyin(respuesta);
  if (r.length === 0) {
    return false;
  }
  return r === normalizarPinyin(correcto);
}

/** Evalúa si el tono elegido es el correcto. */
export function tonoCorrecto(elegido: Tono, esperado: Tono): boolean {
  return elegido === esperado;
}

interface ConHanzi {
  hanzi: string;
}

/**
 * Genera una lista de opciones (correcta + distractores) de tamaño `cantidad`,
 * sin repetir hanzi, en orden barajado de forma determinista según `semilla`.
 */
export function generarOpciones<T extends ConHanzi>(
  correcta: T,
  candidatos: readonly T[],
  cantidad: number,
  semilla: number,
): T[] {
  const distractores: T[] = [];
  const vistos = new Set<string>([correcta.hanzi]);
  // Recorre los candidatos en un orden barajado determinista para variar distractores.
  for (const candidato of barajar(candidatos, semilla)) {
    if (distractores.length >= cantidad - 1) {
      break;
    }
    if (!vistos.has(candidato.hanzi)) {
      vistos.add(candidato.hanzi);
      distractores.push(candidato);
    }
  }
  return barajar([correcta, ...distractores], semilla + 1);
}

/**
 * Baraja de forma pura y determinista (no muta la entrada).
 * Generador congruente lineal simple a partir de `semilla`.
 */
export function barajar<T>(items: readonly T[], semilla: number): T[] {
  const copia = [...items];
  let estado = (Math.abs(Math.trunc(semilla)) % 2147483647) + 1;
  const siguiente = (): number => {
    estado = (estado * 48271) % 2147483647;
    return estado / 2147483647;
  };
  for (let i = copia.length - 1; i > 0; i -= 1) {
    const j = Math.floor(siguiente() * (i + 1));
    const a = copia[i];
    const b = copia[j];
    if (a !== undefined && b !== undefined) {
      copia[i] = b;
      copia[j] = a;
    }
  }
  return copia;
}

/**
 * Lexemas válidos para dictado: una palabra o chengyu de hasta cuatro caracteres,
 * sin separadores. Descarta frases o entradas anómalas demasiado largas para dictar.
 */
export function lexemasParaDictado(lexemas: readonly LexemaSemilla[]): LexemaSemilla[] {
  return lexemas.filter((l) => {
    const longitud = [...l.hanzi].length;
    return longitud >= 1 && longitud <= MAX_HANZI_DICTADO;
  });
}

/**
 * Devuelve el path SVG (en un lienzo 0..100 x 0..100, y hacia abajo) del contorno
 * estilizado de un tono. 1 plano alto, 2 ascendente, 3 cae y sube, 4 descendente.
 */
export function pathTono(tono: Tono): string {
  switch (tono) {
    case 1:
      return 'M 10 25 L 90 25';
    case 2:
      return 'M 10 80 L 90 20';
    case 3:
      return 'M 10 35 Q 50 95 90 30';
    case 4:
      return 'M 10 20 L 90 80';
  }
}

/** Glosa corta de cada tono para etiquetas accesibles. */
export function descripcionTono(tono: Tono): string {
  switch (tono) {
    case 1:
      return 'plano';
    case 2:
      return 'ascendente';
    case 3:
      return 'descendente-ascendente';
    case 4:
      return 'descendente';
  }
}
