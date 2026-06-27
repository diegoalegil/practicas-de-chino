// Tests de la lógica pura de recopilación de glifos del subset.
// Importa directamente las funciones puras del script (sin tocar red ni FS): el
// script guarda la ejecución de main() con un check de "invocado directamente",
// así que importarlo aquí NO descarga ni subsetea nada.

import { describe, it, expect } from 'vitest';
import {
  esHanzi,
  recolectarHanzi,
  construirSet,
  LATIN_BASE,
  PINYIN_DIACRITICS,
  UI_HANZI,
} from './subset-fonts.mjs';

describe('esHanzi', () => {
  it('detecta ideogramas CJK comunes', () => {
    expect(esHanzi('中'.codePointAt(0))).toBe(true);
    expect(esHanzi('经'.codePointAt(0))).toBe(true);
  });

  it('detecta signos de puntuación CJK y formas anchas', () => {
    expect(esHanzi('。'.codePointAt(0))).toBe(true);
    expect(esHanzi('，'.codePointAt(0))).toBe(true);
    expect(esHanzi('？'.codePointAt(0))).toBe(true);
  });

  it('rechaza Latin, dígitos ASCII y vocales con tono', () => {
    expect(esHanzi('a'.codePointAt(0))).toBe(false);
    expect(esHanzi('5'.codePointAt(0))).toBe(false);
    expect(esHanzi('á'.codePointAt(0))).toBe(false);
  });
});

describe('recolectarHanzi', () => {
  it('extrae solo los hanzi de una cadena mixta', () => {
    const set = recolectarHanzi("hanzi: '经济', es: 'economía'");
    expect([...set].sort()).toEqual(['济', '经']);
  });

  it('deduplica caracteres repetidos', () => {
    const set = recolectarHanzi('中中中文');
    expect(set.size).toBe(2);
  });
});

describe('construirSet', () => {
  it('incluye siempre la base Latin, pinyin y hanzi de UI', () => {
    const out = construirSet('');
    for (const ch of UI_HANZI) expect(out).toContain(ch);
    for (const ch of LATIN_BASE) expect(out).toContain(ch);
    expect(out).toContain('ǎ'); // tono 3 sobre a
    expect(out).toContain('ü');
    for (const ch of PINYIN_DIACRITICS) expect(out).toContain(ch);
  });

  it('añade los hanzi del contenido pasado', () => {
    const out = construirSet("hanzi: '画蛇添足'");
    for (const ch of '画蛇添足') expect(out).toContain(ch);
  });

  it('no contiene caracteres duplicados', () => {
    const out = construirSet('中文中文画蛇添足');
    const chars = [...out];
    expect(new Set(chars).size).toBe(chars.length);
  });
});
