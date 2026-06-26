// Tipos de dominio compartidos. Los módulos (Grupos D/E/F) los reutilizan y extienden.

/** Habilidades que mide el diagnóstico y refuerza la reactivación. */
export type Habilidad = 'lectura' | 'escucha' | 'vocab_activo' | 'tonos';

/** Tipos de tarjeta SRS que puede generar un mismo lexema. */
export type TipoTarjeta =
  | 'recognition' // hanzi -> significado
  | 'production' // significado/pinyin -> hanzi
  | 'listening' // audio -> hanzi
  | 'tone' // identificar el tono
  | 'dictation' // audio -> escribir
  | 'writing'; // trazar el carácter

/** Grado de respuesta FSRS: Again | Hard | Good | Easy. */
export type GradoFsrs = 1 | 2 | 3 | 4;

/** Origen de una tarjeta: material nuevo o reactivación de algo ya sabido. */
export type OrigenTarjeta = 'nuevo' | 'reactivacion';

/** Estado de memoria FSRS de una tarjeta (refleja el Card de ts-fsrs). */
export interface EstadoFsrs {
  due: number;
  stability: number;
  difficulty: number;
  elapsed_days: number;
  scheduled_days: number;
  reps: number;
  lapses: number;
  state: 0 | 1 | 2 | 3; // New | Learning | Review | Relearning
  last_review?: number;
}

/** Ejemplo de uso de un lexema. */
export interface Ejemplo {
  hanzi: string;
  pinyin?: string;
  es: string;
}

/** Unidad léxica del contenido semilla (estática, viaja en el bundle). */
export interface LexemaSemilla {
  id: string; // 'w_jingji'
  hanzi: string; // '经济'
  pinyin: string; // 'jīngjì'
  es: string; // 'economía'
  hsk: 3 | 4 | 5 | 6 | 7; // 7 = chengyu / literario
  esChengyu: boolean;
  trazos?: number;
  ejemplo?: Ejemplo;
  tags: string[];
  dificultad: number; // 3..7, para diagnóstico y SRS
}
