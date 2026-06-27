import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { aplicaTema, aplicarTemaGuardado, CLAVE_TEMA, esTema, temaGuardado } from './theme';

beforeEach(() => {
  localStorage.clear();
  document.documentElement.removeAttribute('data-theme');
});

afterEach(() => {
  localStorage.clear();
  document.documentElement.removeAttribute('data-theme');
});

describe('esTema', () => {
  it('acepta los valores válidos', () => {
    expect(esTema('auto')).toBe(true);
    expect(esTema('claro')).toBe(true);
    expect(esTema('oscuro')).toBe(true);
  });

  it('rechaza valores inválidos y null', () => {
    expect(esTema('dark')).toBe(false);
    expect(esTema(null)).toBe(false);
  });
});

describe('aplicaTema', () => {
  it('oscuro pone data-theme="dark"', () => {
    aplicaTema('oscuro');
    expect(document.documentElement.getAttribute('data-theme')).toBe('dark');
    expect(localStorage.getItem(CLAVE_TEMA)).toBe('oscuro');
  });

  it('claro pone data-theme="light"', () => {
    aplicaTema('claro');
    expect(document.documentElement.getAttribute('data-theme')).toBe('light');
  });

  it('auto quita data-theme', () => {
    aplicaTema('oscuro');
    aplicaTema('auto');
    expect(document.documentElement.hasAttribute('data-theme')).toBe(false);
    expect(localStorage.getItem(CLAVE_TEMA)).toBe('auto');
  });
});

describe('temaGuardado', () => {
  it('devuelve auto si no hay nada', () => {
    expect(temaGuardado()).toBe('auto');
  });

  it('devuelve auto si el valor es inválido', () => {
    localStorage.setItem(CLAVE_TEMA, 'basura');
    expect(temaGuardado()).toBe('auto');
  });

  it('lee el tema persistido', () => {
    localStorage.setItem(CLAVE_TEMA, 'oscuro');
    expect(temaGuardado()).toBe('oscuro');
  });
});

describe('aplicarTemaGuardado', () => {
  it('reaplica el tema persistido al documento', () => {
    localStorage.setItem(CLAVE_TEMA, 'oscuro');
    aplicarTemaGuardado();
    expect(document.documentElement.getAttribute('data-theme')).toBe('dark');
  });
});
