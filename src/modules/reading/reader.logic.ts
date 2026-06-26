// Lógica pura del módulo de lectura: segmentación greedy (longest-match) sobre el
// vocabulario glosado y corrección de preguntas de comprensión. Sin DOM ni efectos.

export type NivelLectura = 'intermedio' | 'intermedio-alto' | 'avanzado';

export interface GlosaLexica {
  hanzi: string;
  pinyin: string;
  es: string;
}

export interface PreguntaComprension {
  enunciado: string;
  opciones: string[];
  correcta: number;
  explicacion: string;
}

export interface TextoLectura {
  id: string;
  titulo: string;
  nivel: NivelLectura;
  cuerpo: string;
  glosaEs: string;
  glosas: GlosaLexica[];
  preguntas: PreguntaComprension[];
}

/** Un fragmento del cuerpo segmentado: o bien texto plano, o bien una palabra glosada. */
export interface Segmento {
  texto: string;
  glosa: GlosaLexica | undefined;
}

/**
 * Segmenta `cuerpo` usando coincidencia voraz por longitud máxima contra el
 * vocabulario de `glosas`. Las palabras glosadas se marcan con su glosa; el resto
 * se acumula como texto plano. Fragmentos planos contiguos se fusionan.
 */
export function segmentar(cuerpo: string, glosas: readonly GlosaLexica[]): Segmento[] {
  const porHanzi = new Map<string, GlosaLexica>();
  let maxLongitud = 0;
  for (const glosa of glosas) {
    if (glosa.hanzi.length === 0) {
      continue;
    }
    porHanzi.set(glosa.hanzi, glosa);
    if (glosa.hanzi.length > maxLongitud) {
      maxLongitud = glosa.hanzi.length;
    }
  }

  const segmentos: Segmento[] = [];
  let buffer = '';

  const volcarBuffer = (): void => {
    if (buffer.length > 0) {
      segmentos.push({ texto: buffer, glosa: undefined });
      buffer = '';
    }
  };

  const caracteres = [...cuerpo];
  let i = 0;
  while (i < caracteres.length) {
    let encontrada: GlosaLexica | undefined;
    let longitud = 0;
    const restante = caracteres.length - i;
    const maximo = Math.min(maxLongitud, restante);
    for (let len = maximo; len >= 1; len -= 1) {
      const candidato = caracteres.slice(i, i + len).join('');
      const glosa = porHanzi.get(candidato);
      if (glosa) {
        encontrada = glosa;
        longitud = len;
        break;
      }
    }
    if (encontrada) {
      volcarBuffer();
      segmentos.push({ texto: encontrada.hanzi, glosa: encontrada });
      i += longitud;
    } else {
      const actual = caracteres[i];
      if (actual !== undefined) {
        buffer += actual;
      }
      i += 1;
    }
  }
  volcarBuffer();
  return segmentos;
}

/** Devuelve true si la opción elegida es la correcta para la pregunta. */
export function esCorrecta(pregunta: PreguntaComprension, eleccion: number): boolean {
  return eleccion === pregunta.correcta;
}

/** Cuenta cuántas respuestas son correctas comparando elecciones con las preguntas. */
export function corregir(
  preguntas: readonly PreguntaComprension[],
  elecciones: ReadonlyArray<number | undefined>,
): number {
  let aciertos = 0;
  for (let i = 0; i < preguntas.length; i += 1) {
    const pregunta = preguntas[i];
    const eleccion = elecciones[i];
    if (pregunta && eleccion !== undefined && esCorrecta(pregunta, eleccion)) {
      aciertos += 1;
    }
  }
  return aciertos;
}

/** Cuenta los caracteres hanzi (CJK) de un texto, ignorando puntuación y espacios. */
export function contarHanzi(texto: string): number {
  let total = 0;
  for (const caracter of texto) {
    if (/\p{Script=Han}/u.test(caracter)) {
      total += 1;
    }
  }
  return total;
}

/**
 * Velocidad de lectura en caracteres hanzi por minuto.
 * Devuelve 0 si el tiempo no es positivo para evitar divisiones inválidas.
 */
export function velocidadCpm(caracteres: number, milisegundos: number): number {
  if (milisegundos <= 0) {
    return 0;
  }
  const minutos = milisegundos / 60000;
  return Math.round(caracteres / minutos);
}
