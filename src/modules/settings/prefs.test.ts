import { beforeEach, describe, expect, it } from 'vitest';
import {
  aplicarEscalaFuente,
  aplicarReduceMotion,
  guardarEscalaFuente,
  guardarReduceMotion,
  guardarVelocidad,
  guardarVozPreferida,
  leerEscalaFuente,
  leerReduceMotion,
  leerVelocidad,
  leerVozPreferida,
  limita,
  ESCALA_DEFECTO,
  ESCALA_MAX,
  ESCALA_MIN,
  VELOCIDAD_DEFECTO,
  VELOCIDAD_MAX,
  VELOCIDAD_MIN,
  type PrefsStorage,
} from './prefs';

function storageFalso(): PrefsStorage {
  const mapa = new Map<string, string>();
  return {
    getItem: (clave) => mapa.get(clave) ?? null,
    setItem: (clave, valor) => {
      mapa.set(clave, valor);
    },
  };
}

describe('limita', () => {
  it('restringe al rango', () => {
    expect(limita(5, 0, 1, 0.5)).toBe(1);
    expect(limita(-5, 0, 1, 0.5)).toBe(0);
    expect(limita(0.3, 0, 1, 0.5)).toBe(0.3);
  });

  it('usa el fallback con valores no finitos', () => {
    expect(limita(NaN, 0, 1, 0.7)).toBe(0.7);
    expect(limita(Infinity, 0, 1, 0.7)).toBe(0.7);
  });
});

describe('escala de fuente', () => {
  let store: PrefsStorage;
  beforeEach(() => {
    store = storageFalso();
  });

  it('devuelve el valor por defecto si no hay nada guardado', () => {
    expect(leerEscalaFuente(store)).toBe(ESCALA_DEFECTO);
  });

  it('guarda y lee dentro del rango', () => {
    expect(guardarEscalaFuente(1.2, store)).toBe(1.2);
    expect(leerEscalaFuente(store)).toBe(1.2);
  });

  it('limita los valores fuera de rango al guardar', () => {
    expect(guardarEscalaFuente(99, store)).toBe(ESCALA_MAX);
    expect(guardarEscalaFuente(0, store)).toBe(ESCALA_MIN);
  });

  it('ignora valores corruptos al leer', () => {
    store.setItem('pc.escalaFuente', 'no-es-numero');
    expect(leerEscalaFuente(store)).toBe(ESCALA_DEFECTO);
  });

  it('aplica la variable CSS', () => {
    const raiz = document.createElement('html');
    aplicarEscalaFuente(1.25, raiz);
    expect(raiz.style.getPropertyValue('--escala-fuente')).toBe('1.25');
  });
});

describe('velocidad de la voz', () => {
  let store: PrefsStorage;
  beforeEach(() => {
    store = storageFalso();
  });

  it('por defecto sin valor guardado', () => {
    expect(leerVelocidad(store)).toBe(VELOCIDAD_DEFECTO);
  });

  it('guarda y limita al rango', () => {
    expect(guardarVelocidad(1.2, store)).toBe(1.2);
    expect(guardarVelocidad(9, store)).toBe(VELOCIDAD_MAX);
    expect(guardarVelocidad(0, store)).toBe(VELOCIDAD_MIN);
    expect(leerVelocidad(store)).toBe(VELOCIDAD_MIN);
  });
});

describe('voz preferida', () => {
  it('guarda y lee un nombre', () => {
    const store = storageFalso();
    expect(leerVozPreferida(store)).toBeNull();
    guardarVozPreferida('Ting-Ting', store);
    expect(leerVozPreferida(store)).toBe('Ting-Ting');
  });
});

describe('reduce motion', () => {
  let store: PrefsStorage;
  beforeEach(() => {
    store = storageFalso();
  });

  it('por defecto desactivado', () => {
    expect(leerReduceMotion(store)).toBe(false);
  });

  it('guarda y lee el estado', () => {
    guardarReduceMotion(true, store);
    expect(leerReduceMotion(store)).toBe(true);
    guardarReduceMotion(false, store);
    expect(leerReduceMotion(store)).toBe(false);
  });

  it('aplica y quita el atributo data-reduce-motion', () => {
    const raiz = document.createElement('html');
    aplicarReduceMotion(true, raiz);
    expect(raiz.getAttribute('data-reduce-motion')).toBe('1');
    aplicarReduceMotion(false, raiz);
    expect(raiz.hasAttribute('data-reduce-motion')).toBe(false);
  });
});
