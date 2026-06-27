import type { LexemaSemilla } from '../types';
import { HSK } from './hsk';
import { CHENGYU } from './chengyu';
import { HSK_EXTRA } from './hsk-extra';
import { CHENGYU_EXTRA } from './chengyu-extra';

export { HSK } from './hsk';
export { CHENGYU } from './chengyu';
export { HSK_EXTRA } from './hsk-extra';
export { CHENGYU_EXTRA } from './chengyu-extra';

/** Todo el contenido léxico semilla (HSK 5-6 + chengyu, base + extra). */
export const LEXEMAS: readonly LexemaSemilla[] = [
  ...HSK,
  ...HSK_EXTRA,
  ...CHENGYU,
  ...CHENGYU_EXTRA,
];

const PORID = new Map(LEXEMAS.map((lexema) => [lexema.id, lexema]));

export function lexemaPorId(id: string): LexemaSemilla | undefined {
  return PORID.get(id);
}
