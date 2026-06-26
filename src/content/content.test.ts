import { describe, expect, it } from 'vitest';
import { CHENGYU, HSK, LEXEMAS, lexemaPorId } from './index';

describe('contenido semilla', () => {
  it('tiene 26 palabras HSK y 18 chengyu', () => {
    expect(HSK).toHaveLength(26);
    expect(CHENGYU).toHaveLength(18);
    expect(LEXEMAS).toHaveLength(44);
  });

  it('todos los ids son únicos', () => {
    const ids = LEXEMAS.map((l) => l.id);
    expect(new Set(ids).size).toBe(ids.length);
  });

  it('todos los lexemas tienen hanzi, pinyin y español', () => {
    for (const l of LEXEMAS) {
      expect(l.hanzi.length).toBeGreaterThan(0);
      expect(l.pinyin.length).toBeGreaterThan(0);
      expect(l.es.length).toBeGreaterThan(0);
    }
  });

  it('todos los lexemas tienen una frase de ejemplo', () => {
    for (const l of LEXEMAS) {
      expect(l.ejemplo?.hanzi.length ?? 0).toBeGreaterThan(0);
      expect(l.ejemplo?.es.length ?? 0).toBeGreaterThan(0);
    }
  });

  it('la dificultad está entre 3 y 7 y es coherente con esChengyu', () => {
    for (const l of LEXEMAS) {
      expect(l.dificultad).toBeGreaterThanOrEqual(3);
      expect(l.dificultad).toBeLessThanOrEqual(7);
      if (l.esChengyu) {
        expect(l.hsk).toBe(7);
      }
    }
  });

  it('lexemaPorId encuentra por id', () => {
    expect(lexemaPorId('w_jingji')?.hanzi).toBe('经济');
    expect(lexemaPorId('c_saiwengshima')?.esChengyu).toBe(true);
    expect(lexemaPorId('no-existe')).toBeUndefined();
  });
});
