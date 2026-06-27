import { describe, expect, it } from 'vitest';
import type { LexemaSemilla } from '../../types';
import type { TextoLectura } from '../reading/reader.logic';
import {
  construirBanco,
  crearEstado,
  estaCompleto,
  estimarNivelDe,
  HABILIDADES,
  ITEMS_POR_HABILIDAD,
  MAX_ITEMS,
  NIVEL_INICIAL,
  NIVEL_MAX,
  NIVEL_MIN,
  nivelGlobal,
  perfilPorHabilidad,
  responder,
  resumir,
  siguienteItem,
  type EstadoDiagnostico,
  type FuentesBanco,
  type Habilidad,
  type ItemDiagnostico,
  type RespuestaItem,
} from './diagnostic.logic';

/** Genera un lexema de prueba. */
function lex(id: string, es: string, hanzi: string, dificultad: number): LexemaSemilla {
  return { id, hanzi, pinyin: id, es, hsk: 5, esChengyu: false, dificultad, tags: [] };
}

/** Texto de prueba con una pregunta de comprensión de 4 opciones. */
function texto(id: string, nivel: TextoLectura['nivel']): TextoLectura {
  return {
    id,
    titulo: id,
    nivel,
    cuerpo: '这是一个很短的句子。后面还有更多内容。',
    glosaEs: 'frase corta',
    glosas: [],
    preguntas: [
      {
        enunciado: `¿Pregunta de ${id}?`,
        opciones: [`${id}-a`, `${id}-b`, `${id}-c`, `${id}-d`],
        correcta: 1,
        explicacion: 'porque sí',
      },
    ],
  };
}

/** Fuentes variadas: lexemas en todos los niveles + varios textos. */
function fuentesVariadas(): FuentesBanco {
  const lexemas: LexemaSemilla[] = [];
  let n = 0;
  for (let d = NIVEL_MIN; d <= NIVEL_MAX; d++) {
    for (let i = 0; i < 6; i++) {
      n += 1;
      // hanzi distintos para que escritura/escucha tengan distractores válidos
      lexemas.push(lex(`x${String(n)}`, `sig${String(n)}`, `字${String(n)}`, d));
    }
  }
  const textos = [
    texto('t1', 'intermedio'),
    texto('t2', 'intermedio-alto'),
    texto('t3', 'avanzado'),
    texto('t4', 'intermedio'),
  ];
  return { lexemas, textos };
}

function bancoVariado(): ItemDiagnostico[] {
  return construirBanco(fuentesVariadas(), 42);
}

describe('construirBanco (multi-skill)', () => {
  it('crea ítems con 4 opciones que incluyen la correcta', () => {
    const banco = bancoVariado();
    expect(banco.length).toBeGreaterThan(0);
    for (const item of banco) {
      expect(item.opciones).toHaveLength(4);
      expect(item.opciones).toContain(item.correcta);
      expect(new Set(item.opciones).size).toBe(4);
    }
  });

  it('incluye las cuatro habilidades, repartidas (hasta la cuota)', () => {
    const banco = bancoVariado();
    for (const h of HABILIDADES) {
      const n = banco.filter((it) => it.habilidad === h).length;
      expect(n).toBeGreaterThan(0);
      expect(n).toBeLessThanOrEqual(ITEMS_POR_HABILIDAD);
    }
  });

  it('intercala habilidades (no agrupa todas las de una al inicio)', () => {
    const banco = bancoVariado();
    const primeras = banco.slice(0, 4).map((it) => it.habilidad);
    expect(new Set(primeras).size).toBeGreaterThan(1);
  });

  it('es determinista para una misma semilla', () => {
    const f = fuentesVariadas();
    expect(construirBanco(f, 7)).toEqual(construirBanco(f, 7));
  });

  it('los ítems de lectura salen de textos reales y no llevan lexemaId', () => {
    const banco = bancoVariado();
    const lectura = banco.filter((it) => it.habilidad === 'lectura');
    expect(lectura.length).toBeGreaterThan(0);
    for (const it of lectura) {
      expect(it.lexemaId).toBe('');
      expect(it.prompt).toContain('?');
    }
  });

  it('los ítems de escucha llevan audio (el hanzi a pronunciar)', () => {
    const banco = bancoVariado();
    const escucha = banco.filter((it) => it.habilidad === 'escucha');
    expect(escucha.length).toBeGreaterThan(0);
    for (const it of escucha) {
      expect(it.audio).toBe(it.correcta);
    }
  });
});

describe('escalera adaptativa', () => {
  it('empieza en el nivel inicial', () => {
    const estado = crearEstado(bancoVariado());
    expect(estado.nivelActual).toBe(NIVEL_INICIAL);
    expect(siguienteItem(estado)).toBeDefined();
  });

  it('un acierto sube de nivel', () => {
    let estado = crearEstado(bancoVariado());
    estado = responder(estado, true, 1000);
    expect(estado.nivelActual).toBe(NIVEL_INICIAL + 1);
    expect(estado.ultimaDireccion).toBe(1);
  });

  it('un fallo baja de nivel', () => {
    let estado = crearEstado(bancoVariado());
    estado = responder(estado, false, 1000);
    expect(estado.nivelActual).toBe(NIVEL_INICIAL - 1);
    expect(estado.ultimaDireccion).toBe(-1);
  });

  it('no pasa de los límites NIVEL_MIN / NIVEL_MAX', () => {
    let alto = crearEstado(bancoVariado());
    for (let i = 0; i < 10; i++) {
      alto = responder(alto, true, 500);
    }
    expect(alto.nivelActual).toBeLessThanOrEqual(NIVEL_MAX);

    let bajo = crearEstado(bancoVariado());
    for (let i = 0; i < 10; i++) {
      bajo = responder(bajo, false, 500);
    }
    expect(bajo.nivelActual).toBeGreaterThanOrEqual(NIVEL_MIN);
  });

  it('cuenta una reversión al cambiar de dirección', () => {
    let estado = crearEstado(bancoVariado());
    estado = responder(estado, true, 500);
    expect(estado.reversiones).toBe(0);
    estado = responder(estado, false, 500);
    expect(estado.reversiones).toBe(1);
    estado = responder(estado, true, 500);
    expect(estado.reversiones).toBe(2);
  });

  it('reparte ítems entre habilidades de forma pareja', () => {
    let estado = crearEstado(bancoVariado());
    for (let i = 0; i < 8; i++) {
      estado = responder(estado, true, 500);
    }
    const conteo = new Map<Habilidad, number>();
    for (const r of estado.respuestas) {
      conteo.set(r.habilidad, (conteo.get(r.habilidad) ?? 0) + 1);
    }
    // 8 respuestas / 4 habilidades -> ~2 cada una; nunca > 3.
    for (const h of HABILIDADES) {
      expect(conteo.get(h) ?? 0).toBeLessThanOrEqual(3);
    }
    expect([...conteo.keys()].length).toBe(4);
  });
});

describe('estaCompleto', () => {
  it('no termina antes de MIN_ITEMS aunque haya reversiones', () => {
    let estado = crearEstado(bancoVariado());
    for (let i = 0; i < 6; i++) {
      estado = responder(estado, i % 2 === 0, 500);
    }
    expect(estado.reversiones).toBeGreaterThanOrEqual(2);
    expect(estaCompleto(estado)).toBe(false);
  });

  it('termina al alcanzar MAX_ITEMS', () => {
    let estado = crearEstado(bancoVariado());
    for (let i = 0; i < MAX_ITEMS; i++) {
      estado = responder(estado, true, 500);
    }
    expect(estaCompleto(estado)).toBe(true);
  });

  it('termina si se agota el banco', () => {
    const banco = bancoVariado().slice(0, 3);
    let estado = crearEstado(banco);
    estado = responder(estado, true, 500);
    estado = responder(estado, true, 500);
    estado = responder(estado, true, 500);
    expect(estado.agotado).toBe(true);
    expect(estaCompleto(estado)).toBe(true);
    expect(siguienteItem(estado)).toBeUndefined();
  });
});

/** Construye un estado con respuestas explícitas. */
function conRespuestas(
  datos: Array<Omit<RespuestaItem, 'itemId' | 'lexemaId'>>,
): EstadoDiagnostico {
  const base = crearEstado([]);
  return {
    ...base,
    respuestas: datos.map((d, i) => ({
      itemId: `it${String(i)}`,
      lexemaId: `l${String(i)}`,
      ...d,
    })),
  };
}

describe('estimarNivelDe', () => {
  it('devuelve el nivel más alto con >=70% de acierto', () => {
    const r = (dificultad: number, correcto: boolean): RespuestaItem => ({
      habilidad: 'vocab',
      itemId: `vocab:${String(dificultad)}:${String(correcto)}`,
      lexemaId: 'l',
      dificultad,
      correcto,
      latenciaMs: 1000,
    });
    const nivel = estimarNivelDe([r(5, true), r(5, true), r(5, true), r(6, true), r(6, false)]);
    expect(nivel).toBe(5);
  });

  it('sin respuestas devuelve NIVEL_MIN', () => {
    expect(estimarNivelDe([])).toBe(NIVEL_MIN);
  });
});

describe('perfilPorHabilidad', () => {
  it('siempre devuelve las 4 habilidades, con total 0 si no se evaluó', () => {
    const estado = conRespuestas([
      { habilidad: 'vocab', dificultad: 5, correcto: true, latenciaMs: 1000 },
    ]);
    const perfil = perfilPorHabilidad(estado);
    expect(Object.keys(perfil).sort()).toEqual([...HABILIDADES].sort());
    expect(perfil.vocab.total).toBe(1);
    expect(perfil.lectura.total).toBe(0);
    // Sin div/0: una habilidad sin respuestas no rompe.
    expect(perfil.lectura.nivel).toBe(NIVEL_MIN);
  });

  it('reparte y promedia bien aciertos por habilidad', () => {
    const estado = conRespuestas([
      { habilidad: 'vocab', dificultad: 5, correcto: true, latenciaMs: 1000 },
      { habilidad: 'vocab', dificultad: 5, correcto: false, latenciaMs: 1000 },
      { habilidad: 'escucha', dificultad: 4, correcto: true, latenciaMs: 1000 },
      { habilidad: 'escucha', dificultad: 4, correcto: true, latenciaMs: 1000 },
    ]);
    const perfil = perfilPorHabilidad(estado);
    expect(perfil.vocab.aciertos).toBe(1);
    expect(perfil.vocab.total).toBe(2);
    expect(perfil.escucha.aciertos).toBe(2);
    expect(perfil.escucha.total).toBe(2);
  });
});

describe('nivelGlobal', () => {
  it('promedia solo las habilidades evaluadas y recorta al rango', () => {
    const estado = conRespuestas([
      // vocab domina nivel 7
      { habilidad: 'vocab', dificultad: 7, correcto: true, latenciaMs: 1000 },
      { habilidad: 'vocab', dificultad: 7, correcto: true, latenciaMs: 1000 },
      // escucha domina nivel 3
      { habilidad: 'escucha', dificultad: 3, correcto: true, latenciaMs: 1000 },
      { habilidad: 'escucha', dificultad: 3, correcto: true, latenciaMs: 1000 },
    ]);
    // media(7,3) = 5
    expect(nivelGlobal(estado)).toBe(5);
  });

  it('sin respuestas devuelve NIVEL_MIN (no divide por cero)', () => {
    expect(nivelGlobal(crearEstado([]))).toBe(NIVEL_MIN);
  });
});

describe('resumir', () => {
  it('agrega aciertos, porcentaje, latencia media y perfil', () => {
    const estado = conRespuestas([
      { habilidad: 'vocab', dificultad: 5, correcto: true, latenciaMs: 1000 },
      { habilidad: 'lectura', dificultad: 5, correcto: true, latenciaMs: 3000 },
      { habilidad: 'escucha', dificultad: 6, correcto: false, latenciaMs: 9000 },
    ]);
    const r = resumir(estado);
    expect(r.totalItems).toBe(3);
    expect(r.aciertos).toBe(2);
    expect(r.porcentaje).toBe(67);
    expect(r.latenciaMediaMs).toBe(2000); // solo aciertos
    expect(r.perfil.vocab.aciertos).toBe(1);
    expect(r.perfil.escritura.total).toBe(0);
  });

  it('sin respuestas no divide por cero', () => {
    const r = resumir(crearEstado([]));
    expect(r.totalItems).toBe(0);
    expect(r.porcentaje).toBe(0);
    expect(r.latenciaMediaMs).toBe(0);
    expect(r.nivelHsk).toBe(NIVEL_MIN);
  });
});
