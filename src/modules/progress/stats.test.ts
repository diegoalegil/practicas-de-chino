import { describe, expect, it } from 'vitest';
import { nuevaTarjeta, repasar, type Card } from '../../core/srs/fsrs';
import {
  calcularDominio,
  claveDia,
  maximoDiario,
  nivelIntensidad,
  porcentajeAcierto,
  rachaActual,
  repasosPorDia,
  resumenEstadisticas,
  totalRepasos,
  UMBRAL_MADURA,
  type LogReview,
  type TarjetaConFsrs,
} from './stats.logic';

const MS_POR_DIA = 24 * 60 * 60 * 1000;
const HOY = new Date('2026-06-26T12:00:00');

function review(parcial: Partial<LogReview> & { fecha: number }): LogReview {
  return {
    id: `r@${String(parcial.fecha)}:${Math.random().toString(36).slice(2)}`,
    tarjetaId: 'w_x:recognition',
    grado: 3,
    latenciaMs: 1000,
    ...parcial,
  };
}

function diaOffset(d: number): number {
  return HOY.getTime() - d * MS_POR_DIA;
}

describe('totalRepasos', () => {
  it('cuenta todos los registros', () => {
    expect(totalRepasos([])).toBe(0);
    expect(totalRepasos([review({ fecha: diaOffset(0) }), review({ fecha: diaOffset(1) })])).toBe(
      2,
    );
  });
});

describe('porcentajeAcierto', () => {
  it('devuelve 0 sin datos', () => {
    expect(porcentajeAcierto([])).toBe(0);
  });

  it('cuenta grado >= 3 como acierto y redondea', () => {
    const reviews: LogReview[] = [
      review({ fecha: diaOffset(0), grado: 1 }),
      review({ fecha: diaOffset(0), grado: 2 }),
      review({ fecha: diaOffset(0), grado: 3 }),
      review({ fecha: diaOffset(0), grado: 4 }),
    ];
    expect(porcentajeAcierto(reviews)).toBe(50);
  });
});

describe('rachaActual', () => {
  it('es 0 sin repasos', () => {
    expect(rachaActual([], HOY)).toBe(0);
  });

  it('cuenta días consecutivos terminando hoy', () => {
    const reviews: LogReview[] = [
      review({ fecha: diaOffset(0) }),
      review({ fecha: diaOffset(1) }),
      review({ fecha: diaOffset(2) }),
    ];
    expect(rachaActual(reviews, HOY)).toBe(3);
  });

  it('tolera que hoy aún no tenga repasos si ayer sí', () => {
    const reviews: LogReview[] = [review({ fecha: diaOffset(1) }), review({ fecha: diaOffset(2) })];
    expect(rachaActual(reviews, HOY)).toBe(2);
  });

  it('se rompe con un hueco', () => {
    const reviews: LogReview[] = [
      review({ fecha: diaOffset(0) }),
      review({ fecha: diaOffset(1) }),
      review({ fecha: diaOffset(3) }),
    ];
    expect(rachaActual(reviews, HOY)).toBe(2);
  });

  it('es 0 si el último repaso fue hace más de un día', () => {
    const reviews: LogReview[] = [review({ fecha: diaOffset(3) })];
    expect(rachaActual(reviews, HOY)).toBe(0);
  });

  it('no cuenta dos veces el mismo día', () => {
    const reviews: LogReview[] = [
      review({ fecha: diaOffset(0) }),
      review({ fecha: diaOffset(0) }),
      review({ fecha: diaOffset(0) }),
    ];
    expect(rachaActual(reviews, HOY)).toBe(1);
  });
});

describe('repasosPorDia', () => {
  it('cubre exactamente semanas*7 días', () => {
    const dias = repasosPorDia([], HOY, 12);
    expect(dias).toHaveLength(84);
  });

  it('agrega repasos por día y rellena vacíos con 0', () => {
    const reviews: LogReview[] = [
      review({ fecha: diaOffset(0) }),
      review({ fecha: diaOffset(0) }),
      review({ fecha: diaOffset(1) }),
    ];
    const dias = repasosPorDia(reviews, HOY, 4);
    const hoyClave = claveDia(diaOffset(0));
    const ayerClave = claveDia(diaOffset(1));
    const hoyDia = dias.find((d) => d.fecha === hoyClave);
    const ayerDia = dias.find((d) => d.fecha === ayerClave);
    expect(hoyDia?.total).toBe(2);
    expect(ayerDia?.total).toBe(1);
    const conRepasos = dias.filter((d) => d.total > 0);
    expect(conRepasos).toHaveLength(2);
  });

  it('está ordenado cronológicamente', () => {
    const dias = repasosPorDia([], HOY, 4);
    for (let i = 1; i < dias.length; i += 1) {
      const prev = dias[i - 1];
      const cur = dias[i];
      expect(prev && cur && prev.fecha < cur.fecha).toBe(true);
    }
  });
});

describe('calcularDominio', () => {
  function carta(fsrs: Card): TarjetaConFsrs {
    return { fsrs };
  }

  it('clasifica nuevas como state 0', () => {
    const d = calcularDominio([carta(nuevaTarjeta(HOY))]);
    expect(d.nuevas).toBe(1);
    expect(d.aprendiendo + d.jovenes + d.maduras).toBe(0);
  });

  it('una tarjeta repasada deja de ser nueva', () => {
    const repasada = repasar(nuevaTarjeta(HOY), 3, HOY);
    const d = calcularDominio([carta(repasada)]);
    expect(d.nuevas).toBe(0);
    expect(d.aprendiendo + d.jovenes + d.maduras).toBe(1);
  });

  it('separa jóvenes de maduras por estabilidad', () => {
    const base = nuevaTarjeta(HOY);
    const joven: Card = { ...base, state: 2, stability: 5 };
    const madura: Card = { ...base, state: 2, stability: UMBRAL_MADURA + 10 };
    const d = calcularDominio([carta(joven), carta(madura)]);
    expect(d.jovenes).toBe(1);
    expect(d.maduras).toBe(1);
  });

  it('cuenta relearning (state 3) como aprendiendo', () => {
    const base = nuevaTarjeta(HOY);
    const relearn: Card = { ...base, state: 3, stability: 2 };
    const d = calcularDominio([carta(relearn)]);
    expect(d.aprendiendo).toBe(1);
  });
});

describe('nivelIntensidad', () => {
  it('0 repasos -> nivel 0', () => {
    expect(nivelIntensidad(0, 10)).toBe(0);
  });

  it('escala contra el máximo', () => {
    expect(nivelIntensidad(10, 10)).toBe(4);
    expect(nivelIntensidad(6, 10)).toBe(3);
    expect(nivelIntensidad(4, 10)).toBe(2);
    expect(nivelIntensidad(1, 10)).toBe(1);
  });

  it('con máximo 0 pero total positivo da nivel 1', () => {
    expect(nivelIntensidad(3, 0)).toBe(1);
  });
});

describe('maximoDiario', () => {
  it('devuelve el mayor total', () => {
    expect(maximoDiario([])).toBe(0);
    expect(
      maximoDiario([
        { fecha: '2026-06-01', total: 3 },
        { fecha: '2026-06-02', total: 9 },
        { fecha: '2026-06-03', total: 1 },
      ]),
    ).toBe(9);
  });
});

describe('resumenEstadisticas', () => {
  it('compone total, aciertos, porcentaje y racha', () => {
    const reviews: LogReview[] = [
      review({ fecha: diaOffset(0), grado: 4 }),
      review({ fecha: diaOffset(1), grado: 1 }),
    ];
    const r = resumenEstadisticas(reviews, HOY);
    expect(r.totalRepasos).toBe(2);
    expect(r.aciertos).toBe(1);
    expect(r.porcentajeAcierto).toBe(50);
    expect(r.racha).toBe(2);
  });

  it('caso vacío es todo cero', () => {
    const r = resumenEstadisticas([], HOY);
    expect(r).toEqual({ totalRepasos: 0, aciertos: 0, porcentajeAcierto: 0, racha: 0 });
  });
});
