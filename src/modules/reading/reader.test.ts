import { describe, expect, it } from 'vitest';
import {
  contarHanzi,
  corregir,
  esCorrecta,
  segmentar,
  velocidadCpm,
  type GlosaLexica,
  type PreguntaComprension,
} from './reader.logic';
import { TEXTOS, textoPorId } from './data';

const GLOSAS: GlosaLexica[] = [
  { hanzi: '内卷', pinyin: 'nèijuǎn', es: 'involución' },
  { hanzi: '加班', pinyin: 'jiābān', es: 'horas extra' },
  { hanzi: '精疲力尽', pinyin: 'jīng pí lì jìn', es: 'agotado' },
];

describe('segmentar', () => {
  it('detecta las palabras glosadas como segmentos con glosa', () => {
    const segmentos = segmentar('大家在内卷中加班', GLOSAS);
    const glosados = segmentos.filter((s) => s.glosa !== undefined).map((s) => s.texto);
    expect(glosados).toContain('内卷');
    expect(glosados).toContain('加班');
  });

  it('acumula el texto no glosado como segmentos planos contiguos', () => {
    const segmentos = segmentar('大家在内卷中', GLOSAS);
    expect(segmentos[0]?.glosa).toBeUndefined();
    expect(segmentos[0]?.texto).toBe('大家在');
    expect(segmentos[1]?.texto).toBe('内卷');
    expect(segmentos[1]?.glosa?.es).toBe('involución');
    expect(segmentos[2]?.texto).toBe('中');
  });

  it('usa longest-match: prefiere la palabra de 4 caracteres', () => {
    const segmentos = segmentar('他精疲力尽了', GLOSAS);
    const glosa = segmentos.find((s) => s.glosa !== undefined);
    expect(glosa?.texto).toBe('精疲力尽');
  });

  it('reconstruye el cuerpo original al concatenar los segmentos', () => {
    const cuerpo = '大家在内卷中加班到精疲力尽';
    const segmentos = segmentar(cuerpo, GLOSAS);
    expect(segmentos.map((s) => s.texto).join('')).toBe(cuerpo);
  });

  it('no glosa nada cuando no hay vocabulario', () => {
    const segmentos = segmentar('大家在内卷', []);
    expect(segmentos).toHaveLength(1);
    expect(segmentos[0]?.glosa).toBeUndefined();
  });
});

describe('corrección de preguntas', () => {
  const preguntas: PreguntaComprension[] = [
    { enunciado: 'p1', opciones: ['a', 'b'], correcta: 1, explicacion: 'x' },
    { enunciado: 'p2', opciones: ['a', 'b', 'c'], correcta: 0, explicacion: 'y' },
  ];

  it('esCorrecta compara contra el índice correcto', () => {
    const p = preguntas[0];
    expect(p).toBeDefined();
    if (!p) {
      return;
    }
    expect(esCorrecta(p, 1)).toBe(true);
    expect(esCorrecta(p, 0)).toBe(false);
  });

  it('corregir cuenta solo los aciertos', () => {
    expect(corregir(preguntas, [1, 0])).toBe(2);
    expect(corregir(preguntas, [1, 2])).toBe(1);
    expect(corregir(preguntas, [undefined, undefined])).toBe(0);
  });

  it('corregir ignora elecciones más allá del número de preguntas', () => {
    expect(corregir(preguntas, [1, 0, 5])).toBe(2);
  });
});

describe('métricas de lectura', () => {
  it('contarHanzi cuenta solo caracteres Han', () => {
    expect(contarHanzi('内卷，加班！abc 123')).toBe(4);
  });

  it('velocidadCpm calcula caracteres por minuto', () => {
    expect(velocidadCpm(300, 60000)).toBe(300);
    expect(velocidadCpm(150, 60000)).toBe(150);
    expect(velocidadCpm(100, 0)).toBe(0);
  });
});

describe('datos semilla', () => {
  it('los textos tienen preguntas y glosas completas', () => {
    expect(TEXTOS.length).toBeGreaterThanOrEqual(2);
    const ids = TEXTOS.map((t) => t.id);
    expect(new Set(ids).size).toBe(ids.length);
    for (const texto of TEXTOS) {
      expect(texto.preguntas.length).toBeGreaterThanOrEqual(1);
      expect(texto.glosas.length).toBeGreaterThan(0);
      expect(texto.cuerpo.length).toBeGreaterThan(0);
      for (const pregunta of texto.preguntas) {
        expect(pregunta.correcta).toBeGreaterThanOrEqual(0);
        expect(pregunta.correcta).toBeLessThan(pregunta.opciones.length);
      }
    }
  });

  it('cada glosa de un texto aparece en su cuerpo y se segmenta', () => {
    for (const texto of TEXTOS) {
      const segmentos = segmentar(texto.cuerpo, texto.glosas);
      const detectadas = new Set(
        segmentos.filter((s) => s.glosa !== undefined).map((s) => s.texto),
      );
      for (const glosa of texto.glosas) {
        expect(texto.cuerpo).toContain(glosa.hanzi);
        expect(detectadas.has(glosa.hanzi)).toBe(true);
      }
    }
  });

  it('textoPorId recupera por id', () => {
    expect(textoPorId('neijuan')?.titulo).toBe('关于内卷');
    expect(textoPorId('inexistente')).toBeUndefined();
  });
});
