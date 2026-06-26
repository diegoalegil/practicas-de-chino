import { describe, expect, it } from 'vitest';
import {
  BANCO_TONOS,
  barajar,
  descripcionTono,
  generarOpciones,
  lexemasParaDictado,
  normalizarPinyin,
  pathTono,
  pinyinCoincide,
  tonoCorrecto,
  type Tono,
} from './listening.logic';
import type { LexemaSemilla } from '../../types';

function lexema(id: string, hanzi: string, pinyin: string): LexemaSemilla {
  return {
    id,
    hanzi,
    pinyin,
    es: 'glosa',
    hsk: 5,
    esChengyu: false,
    tags: [],
    dificultad: 5,
  };
}

describe('normalizarPinyin', () => {
  it('quita las marcas tonales', () => {
    expect(normalizarPinyin('jīngjì')).toBe('jingji');
    expect(normalizarPinyin('mǎ')).toBe('ma');
  });

  it('ignora mayúsculas, espacios y signos', () => {
    expect(normalizarPinyin('  Jīng Jì ')).toBe('jingji');
    expect(normalizarPinyin("xi'an")).toBe('xian');
  });

  it("trata 'ü' y 'v' como 'u'", () => {
    expect(normalizarPinyin('xiàolǜ')).toBe('xiaolu');
    expect(normalizarPinyin('lv')).toBe('lu');
  });

  it('descarta dígitos y devuelve cadena vacía si no hay letras', () => {
    expect(normalizarPinyin('ma3')).toBe('ma');
    expect(normalizarPinyin('123 ...')).toBe('');
  });
});

describe('pinyinCoincide', () => {
  it('acepta la misma sílaba con o sin tonos', () => {
    expect(pinyinCoincide('ma', 'mǎ')).toBe(true);
    expect(pinyinCoincide('MA', 'mà')).toBe(true);
    expect(pinyinCoincide('jing ji', 'jīngjì')).toBe(true);
  });

  it('rechaza pinyin distinto', () => {
    expect(pinyinCoincide('mai', 'mǎ')).toBe(false);
  });

  it('rechaza respuesta vacía o solo separadores', () => {
    expect(pinyinCoincide('', 'mǎ')).toBe(false);
    expect(pinyinCoincide('   ', 'mǎ')).toBe(false);
    expect(pinyinCoincide('--', 'mǎ')).toBe(false);
  });
});

describe('tonoCorrecto', () => {
  it('compara el tono elegido con el esperado', () => {
    expect(tonoCorrecto(3, 3)).toBe(true);
    expect(tonoCorrecto(1, 2)).toBe(false);
  });
});

describe('generarOpciones', () => {
  const banco = BANCO_TONOS;

  it('incluye siempre la opción correcta', () => {
    const correcta = banco[0];
    expect(correcta).toBeDefined();
    if (!correcta) {
      return;
    }
    const opciones = generarOpciones(correcta, banco, 4, 7);
    expect(opciones).toContain(correcta);
  });

  it('devuelve la cantidad pedida sin hanzi repetidos', () => {
    const correcta = banco[0];
    expect(correcta).toBeDefined();
    if (!correcta) {
      return;
    }
    const opciones = generarOpciones(correcta, banco, 4, 3);
    expect(opciones).toHaveLength(4);
    const hanzis = new Set(opciones.map((o) => o.hanzi));
    expect(hanzis.size).toBe(4);
  });

  it('es determinista para la misma semilla', () => {
    const correcta = banco[2];
    expect(correcta).toBeDefined();
    if (!correcta) {
      return;
    }
    const a = generarOpciones(correcta, banco, 4, 42).map((o) => o.hanzi);
    const b = generarOpciones(correcta, banco, 4, 42).map((o) => o.hanzi);
    expect(a).toEqual(b);
  });

  it('no produce un distractor igual a la correcta aunque el hanzi se repita en el banco', () => {
    const correcta = lexema('x', '马', 'mǎ');
    const conDuplicado = [correcta, lexema('y', '马', 'mà'), lexema('z', '门', 'mén')];
    const opciones = generarOpciones(correcta, conDuplicado, 4, 1);
    const repetidos = opciones.filter((o) => o.hanzi === '马');
    expect(repetidos).toHaveLength(1);
  });
});

describe('barajar', () => {
  it('conserva todos los elementos', () => {
    const entrada = [1, 2, 3, 4, 5];
    const salida = barajar(entrada, 9);
    expect([...salida].sort((x, y) => x - y)).toEqual(entrada);
  });

  it('no muta la entrada', () => {
    const entrada = [1, 2, 3];
    barajar(entrada, 1);
    expect(entrada).toEqual([1, 2, 3]);
  });

  it('maneja arrays vacíos y de un elemento', () => {
    expect(barajar([], 5)).toEqual([]);
    expect(barajar(['solo'], 5)).toEqual(['solo']);
  });
});

describe('lexemasParaDictado', () => {
  it('mantiene palabras y chengyu de hasta cuatro caracteres', () => {
    const lexemas = [lexema('w_a', '经济', 'jīngjì'), lexema('c_a', '画蛇添足', 'huàshétiānzú')];
    expect(lexemasParaDictado(lexemas)).toHaveLength(2);
  });

  it('descarta entradas demasiado largas para dictar', () => {
    const lexemas = [
      lexema('w_a', '经济', 'jīngjì'),
      lexema('frase', '中国的经济发展得很快', 'zhōngguó...'),
    ];
    const resultado = lexemasParaDictado(lexemas);
    expect(resultado).toHaveLength(1);
    expect(resultado[0]?.id).toBe('w_a');
  });
});

describe('pathTono', () => {
  it('devuelve un path SVG distinto para cada tono', () => {
    const paths = ([1, 2, 3, 4] as Tono[]).map((tono) => pathTono(tono));
    for (const path of paths) {
      expect(path.startsWith('M')).toBe(true);
    }
    expect(new Set(paths).size).toBe(4);
  });

  it('el tono 3 usa una curva (Q)', () => {
    expect(pathTono(3)).toContain('Q');
  });
});

describe('descripcionTono', () => {
  it('describe cada tono', () => {
    expect(descripcionTono(1)).toBe('plano');
    expect(descripcionTono(2)).toBe('ascendente');
    expect(descripcionTono(3)).toBe('descendente-ascendente');
    expect(descripcionTono(4)).toBe('descendente');
  });
});
