import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import {
  CLAVE_ONBOARDING,
  PASOS,
  VALOR_HECHO,
  anterior,
  debeMostrarOnboarding,
  destinoSwipe,
  esPrimero,
  esUltimo,
  estadoInicial,
  irA,
  marcarOnboardingHecho,
  reiniciarOnboarding,
  siguiente,
} from './onboarding.logic';

describe('contenido de pasos', () => {
  it('tiene exactamente 4 pasos con ids unicos', () => {
    expect(PASOS).toHaveLength(4);
    const ids = new Set(PASOS.map((p) => p.id));
    expect(ids.size).toBe(4);
  });

  it('cada paso aporta hero, titulo y cuerpo no vacios', () => {
    for (const paso of PASOS) {
      expect(paso.hero.length).toBeGreaterThan(0);
      expect(paso.titulo.length).toBeGreaterThan(0);
      expect(paso.cuerpo.length).toBeGreaterThan(0);
    }
  });
});

describe('navegacion de estado', () => {
  it('arranca en el primer paso', () => {
    const e = estadoInicial();
    expect(e.indice).toBe(0);
    expect(e.total).toBe(PASOS.length);
    expect(esPrimero(e)).toBe(true);
    expect(esUltimo(e)).toBe(false);
  });

  it('siguiente avanza y se detiene en el ultimo', () => {
    let e = estadoInicial(4);
    e = siguiente(e);
    expect(e.indice).toBe(1);
    e = siguiente(siguiente(siguiente(e)));
    expect(e.indice).toBe(3);
    expect(esUltimo(e)).toBe(true);
    e = siguiente(e);
    expect(e.indice).toBe(3);
  });

  it('anterior retrocede y se detiene en el primero', () => {
    let e = irA(estadoInicial(4), 2);
    e = anterior(e);
    expect(e.indice).toBe(1);
    e = anterior(anterior(anterior(e)));
    expect(e.indice).toBe(0);
    expect(esPrimero(e)).toBe(true);
  });

  it('irA limita el indice al rango valido', () => {
    const e = estadoInicial(4);
    expect(irA(e, -5).indice).toBe(0);
    expect(irA(e, 99).indice).toBe(3);
    expect(irA(e, 2).indice).toBe(2);
  });

  it('total 0 nunca produce indices fuera de rango', () => {
    const e = estadoInicial(0);
    expect(siguiente(e).indice).toBe(0);
    expect(anterior(e).indice).toBe(0);
    expect(esUltimo(e)).toBe(false);
  });
});

describe('destinoSwipe', () => {
  const e = irA(estadoInicial(4), 1);

  it('arrastre suficiente a la izquierda avanza', () => {
    expect(destinoSwipe(e, -80)).toBe(2);
  });

  it('arrastre suficiente a la derecha retrocede', () => {
    expect(destinoSwipe(e, 80)).toBe(0);
  });

  it('arrastre por debajo del umbral no mueve', () => {
    expect(destinoSwipe(e, -10)).toBe(1);
    expect(destinoSwipe(e, 10)).toBe(1);
  });

  it('respeta los limites en los extremos', () => {
    expect(destinoSwipe(estadoInicial(4), 200)).toBe(0);
    expect(destinoSwipe(irA(estadoInicial(4), 3), -200)).toBe(3);
  });
});

describe('persistencia en localStorage', () => {
  beforeEach(() => {
    localStorage.clear();
  });
  afterEach(() => {
    localStorage.clear();
  });

  it('debeMostrarOnboarding es true sin flag', () => {
    expect(debeMostrarOnboarding()).toBe(true);
  });

  it('marcarOnboardingHecho fija el flag y oculta despues', () => {
    marcarOnboardingHecho();
    expect(localStorage.getItem(CLAVE_ONBOARDING)).toBe(VALOR_HECHO);
    expect(debeMostrarOnboarding()).toBe(false);
  });

  it('un valor distinto del esperado vuelve a mostrar', () => {
    localStorage.setItem(CLAVE_ONBOARDING, 'otro');
    expect(debeMostrarOnboarding()).toBe(true);
  });

  it('reiniciarOnboarding vuelve a habilitarlo', () => {
    marcarOnboardingHecho();
    reiniciarOnboarding();
    expect(debeMostrarOnboarding()).toBe(true);
  });
});
