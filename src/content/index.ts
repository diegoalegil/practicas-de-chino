import type { LexemaSemilla } from '../types';
import { HSK } from './hsk';
import { CHENGYU } from './chengyu';

export { HSK } from './hsk';
export { CHENGYU } from './chengyu';

/** Todo el contenido léxico semilla (HSK 5-6 + chengyu). */
export const LEXEMAS: readonly LexemaSemilla[] = [...HSK, ...CHENGYU];

const PORID = new Map(LEXEMAS.map((lexema) => [lexema.id, lexema]));

export function lexemaPorId(id: string): LexemaSemilla | undefined {
  return PORID.get(id);
}
