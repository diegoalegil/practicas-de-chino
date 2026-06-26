import { describe, expect, it } from 'vitest';
import type { LexemaSemilla } from '../../types';
import {
  construirBanco,
  crearEstadoDiagnostico,
  estaCompleto,
  estimarNivel,
  MAX_ITEMS,
  NIVEL_INICIAL,
  NIVEL_MAX,
  NIVEL_MIN,
  resumir,
  responderItem,
  siguienteItem,
  type EstadoDiagnostico,
  type ItemDiagnostico,
} from './diagnostic.logic';

/** Genera un lexema de prueba. */
function lex(id: string, es: string, dificultad: number): LexemaSemilla {
  return {
    id,
    hanzi: id,
    pinyin: id,
    es,
    hsk: 5,
    esChengyu: false,
    dificultad,
    tags: [],
  };
}

/** Banco grande y variado para tener ítems en todos los niveles. */
function bancoVariado(): ItemDiagnostico[] {
  const lexemas: LexemaSemilla[] = [];
  let n = 0;
  for (let d = NIVEL_MIN; d <= NIVEL_MAX; d++) {
    for (let i = 0; i < 6; i++) {
      n += 1;
      lexemas.push(lex(`x${String(n)}`, `sig${String(n)}`, d));
    }
  }
  return construirBanco(lexemas, 42);
}

describe('construirBanco', () => {
  it('crea ítems con 4 opciones que incluyen la correcta', () => {
    const banco = bancoVariado();
    expect(banco.length).toBeGreaterThan(0);
    for (const item of banco) {
      expect(item.opciones).toHaveLength(4);
      expect(item.opciones).toContain(item.correcta);
      expect(new Set(item.opciones).size).toBe(4); // sin duplicados
    }
  });

  it('es determinista para una misma semilla', () => {
    const lexemas = [
      lex('a', 'uno', 5),
      lex('b', 'dos', 5),
      lex('c', 'tres', 5),
      lex('d', 'cuatro', 5),
      lex('e', 'cinco', 5),
    ];
    const x = construirBanco(lexemas, 7);
    const y = construirBanco(lexemas, 7);
    expect(x).toEqual(y);
  });

  it('omite lexemas sin distractores suficientes', () => {
    const banco = construirBanco([lex('a', 'uno', 5), lex('b', 'dos', 5)], 1);
    expect(banco).toHaveLength(0); // solo 1 distractor posible, faltan 2
  });
});

describe('escalera adaptativa', () => {
  it('empieza en el nivel inicial', () => {
    const estado = crearEstadoDiagnostico(bancoVariado());
    expect(estado.nivelActual).toBe(NIVEL_INICIAL);
    expect(siguienteItem(estado)?.dificultad).toBe(NIVEL_INICIAL);
  });

  it('un acierto sube de nivel', () => {
    let estado = crearEstadoDiagnostico(bancoVariado());
    estado = responderItem(estado, true, 1000);
    expect(estado.nivelActual).toBe(NIVEL_INICIAL + 1);
    expect(estado.ultimaDireccion).toBe(1);
  });

  it('un fallo baja de nivel', () => {
    let estado = crearEstadoDiagnostico(bancoVariado());
    estado = responderItem(estado, false, 1000);
    expect(estado.nivelActual).toBe(NIVEL_INICIAL - 1);
    expect(estado.ultimaDireccion).toBe(-1);
  });

  it('no pasa de los límites NIVEL_MIN / NIVEL_MAX', () => {
    let alto = crearEstadoDiagnostico(bancoVariado());
    for (let i = 0; i < 10; i++) {
      alto = responderItem(alto, true, 500);
    }
    expect(alto.nivelActual).toBeLessThanOrEqual(NIVEL_MAX);

    let bajo = crearEstadoDiagnostico(bancoVariado());
    for (let i = 0; i < 10; i++) {
      bajo = responderItem(bajo, false, 500);
    }
    expect(bajo.nivelActual).toBeGreaterThanOrEqual(NIVEL_MIN);
  });

  it('cuenta una reversión al cambiar de dirección', () => {
    let estado = crearEstadoDiagnostico(bancoVariado());
    estado = responderItem(estado, true, 500); // sube (dir 1)
    expect(estado.reversiones).toBe(0);
    estado = responderItem(estado, false, 500); // baja (dir -1): reversión
    expect(estado.reversiones).toBe(1);
    estado = responderItem(estado, true, 500); // sube de nuevo: otra reversión
    expect(estado.reversiones).toBe(2);
  });
});

describe('estaCompleto', () => {
  it('no termina antes de MIN_ITEMS aunque haya reversiones', () => {
    let estado = crearEstadoDiagnostico(bancoVariado());
    // alternar para acumular reversiones rápido
    for (let i = 0; i < 6; i++) {
      estado = responderItem(estado, i % 2 === 0, 500);
    }
    expect(estado.reversiones).toBeGreaterThanOrEqual(2);
    expect(estaCompleto(estado)).toBe(false);
  });

  it('termina al alcanzar MAX_ITEMS', () => {
    let estado = crearEstadoDiagnostico(bancoVariado());
    for (let i = 0; i < MAX_ITEMS; i++) {
      estado = responderItem(estado, true, 500);
    }
    expect(estaCompleto(estado)).toBe(true);
  });

  it('termina si se agota el banco', () => {
    const banco = bancoVariado().slice(0, 3);
    let estado = crearEstadoDiagnostico(banco);
    estado = responderItem(estado, true, 500);
    estado = responderItem(estado, true, 500);
    estado = responderItem(estado, true, 500);
    expect(estado.agotado).toBe(true);
    expect(estaCompleto(estado)).toBe(true);
    expect(siguienteItem(estado)).toBeUndefined();
  });
});

describe('estimarNivel', () => {
  function conRespuestas(datos: { dificultad: number; correcto: boolean }[]): EstadoDiagnostico {
    const base = crearEstadoDiagnostico([]);
    return {
      ...base,
      respuestas: datos.map((d, i) => ({
        lexemaId: `l${String(i)}`,
        dificultad: d.dificultad,
        correcto: d.correcto,
        latenciaMs: 1000,
      })),
    };
  }

  it('devuelve el nivel más alto con >=70% de acierto', () => {
    const estado = conRespuestas([
      { dificultad: 5, correcto: true },
      { dificultad: 5, correcto: true },
      { dificultad: 5, correcto: true },
      { dificultad: 6, correcto: true },
      { dificultad: 6, correcto: false }, // 50% en nivel 6
    ]);
    expect(estimarNivel(estado)).toBe(5);
  });

  it('si supera el umbral en el nivel alto, lo elige', () => {
    const estado = conRespuestas([
      { dificultad: 6, correcto: true },
      { dificultad: 6, correcto: true },
      { dificultad: 6, correcto: true },
      { dificultad: 7, correcto: true },
      { dificultad: 7, correcto: true },
    ]);
    expect(estimarNivel(estado)).toBe(7);
  });

  it('sin acierto suficiente devuelve el nivel más bajo evaluado', () => {
    const estado = conRespuestas([
      { dificultad: 5, correcto: false },
      { dificultad: 6, correcto: false },
    ]);
    expect(estimarNivel(estado)).toBe(5);
  });

  it('sin respuestas devuelve NIVEL_MIN', () => {
    expect(estimarNivel(crearEstadoDiagnostico([]))).toBe(NIVEL_MIN);
  });
});

describe('resumir', () => {
  it('agrega aciertos, porcentaje y latencia media de aciertos', () => {
    const base = crearEstadoDiagnostico([]);
    const estado: EstadoDiagnostico = {
      ...base,
      respuestas: [
        { lexemaId: 'a', dificultad: 5, correcto: true, latenciaMs: 1000 },
        { lexemaId: 'b', dificultad: 5, correcto: true, latenciaMs: 3000 },
        { lexemaId: 'c', dificultad: 6, correcto: false, latenciaMs: 9000 },
      ],
    };
    const r = resumir(estado);
    expect(r.totalItems).toBe(3);
    expect(r.aciertos).toBe(2);
    expect(r.porcentaje).toBe(67);
    expect(r.latenciaMediaMs).toBe(2000); // solo aciertos
  });
});
