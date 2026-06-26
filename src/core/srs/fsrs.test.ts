import { describe, expect, it } from 'vitest';
import { estaVencida, nuevaTarjeta, repasar } from './fsrs';

const AHORA = new Date('2026-01-01T08:00:00Z');

describe('motor FSRS', () => {
  it('una tarjeta nueva empieza en estado New y vencida', () => {
    const card = nuevaTarjeta(AHORA);
    expect(card.reps).toBe(0);
    expect(card.state).toBe(0); // New
    expect(estaVencida(card, AHORA)).toBe(true);
  });

  it('un "Good" incrementa reps y aleja el vencimiento', () => {
    const card = nuevaTarjeta(AHORA);
    const tras = repasar(card, 3, AHORA);
    expect(tras.reps).toBe(1);
    expect(new Date(tras.due).getTime()).toBeGreaterThan(AHORA.getTime());
  });

  it('"Again" tras varios repasos registra un lapse', () => {
    let card = nuevaTarjeta(AHORA);
    card = repasar(card, 3, AHORA);
    const masTarde = new Date(new Date(card.due).getTime());
    card = repasar(card, 3, masTarde);
    const otra = new Date(new Date(card.due).getTime());
    const fallada = repasar(card, 1, otra);
    expect(fallada.lapses).toBeGreaterThanOrEqual(1);
  });

  it('"Easy" aleja más el vencimiento que "Hard"', () => {
    const base = nuevaTarjeta(AHORA);
    const easy = repasar(base, 4, AHORA);
    const hard = repasar(base, 2, AHORA);
    expect(new Date(easy.due).getTime()).toBeGreaterThan(new Date(hard.due).getTime());
  });
});
