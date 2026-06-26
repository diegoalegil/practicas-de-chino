import { describe, expect, it } from 'vitest';
import { planificarSplash, type PlanFotograma } from './splash.logic';

function offsets(fotogramas: readonly PlanFotograma[]): number[] {
  return fotogramas.map((f) => f.offset);
}

describe('planificarSplash (modo normal)', () => {
  const plan = planificarSplash({ duracionBase: 1600, reducido: false });

  it('encaja la duracion total cerca de la base objetivo', () => {
    expect(plan.total).toBeGreaterThan(1200);
    expect(plan.total).toBeLessThanOrEqual(1900);
  });

  it('el caracter revela de clip oculto a visible', () => {
    const primero = plan.caracter.keyframes[0];
    const ultimo = plan.caracter.keyframes[plan.caracter.keyframes.length - 1];
    expect(primero?.opacity).toBe(0);
    expect(primero?.clipPath).toContain('100%');
    expect(ultimo?.opacity).toBe(1);
    expect(ultimo?.clipPath).toBe('inset(0 0 0 0)');
  });

  it('el sello cae con overshoot (empieza arriba, termina centrado)', () => {
    const primero = plan.sello.keyframes[0];
    const ultimo = plan.sello.keyframes[plan.sello.keyframes.length - 1];
    expect(primero?.transform).toContain('translateY(-60%)');
    expect(ultimo?.transform).toContain('translateY(0)');
    expect(plan.sello.retraso).toBeGreaterThan(0);
  });

  it('el fade de salida arranca despues de las dos entradas', () => {
    expect(plan.fadeSalida.retraso).toBeGreaterThanOrEqual(plan.caracter.duracion);
    expect(plan.fadeSalida.retraso).toBeGreaterThanOrEqual(
      plan.sello.retraso + plan.sello.duracion,
    );
  });

  it('todos los offsets de keyframes estan en [0,1] y ordenados', () => {
    for (const tira of [plan.caracter, plan.sello, plan.fadeSalida]) {
      const os = offsets(tira.keyframes);
      const primero = os[0];
      const ultimo = os[os.length - 1];
      expect(primero).toBe(0);
      expect(ultimo).toBe(1);
      const ordenados = [...os].sort((a, b) => a - b);
      expect(os).toEqual(ordenados);
    }
  });
});

describe('planificarSplash (reduced-motion)', () => {
  const plan = planificarSplash({ duracionBase: 1600, reducido: true });

  it('resuelve casi inmediato', () => {
    expect(plan.total).toBeLessThanOrEqual(100);
  });

  it('no aplica transforms en caracter ni sello (solo opacidad)', () => {
    for (const f of [...plan.caracter.keyframes, ...plan.sello.keyframes]) {
      expect(f.transform).toBeUndefined();
      expect(f.clipPath).toBeUndefined();
    }
  });

  it('el fade sigue llevando de opaco a transparente', () => {
    const primero = plan.fadeSalida.keyframes[0];
    const ultimo = plan.fadeSalida.keyframes[plan.fadeSalida.keyframes.length - 1];
    expect(primero?.opacity).toBe(1);
    expect(ultimo?.opacity).toBe(0);
  });
});
