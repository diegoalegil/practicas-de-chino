import { describe, expect, it, vi } from 'vitest';
import {
  aplicarTransicion,
  soportaViewTransition,
  type DocConTransicion,
} from './transition.logic';

describe('soportaViewTransition', () => {
  it('false cuando el doc es undefined', () => {
    expect(soportaViewTransition(undefined)).toBe(false);
  });

  it('false cuando no existe startViewTransition', () => {
    expect(soportaViewTransition({})).toBe(false);
  });

  it('true cuando existe la funcion', () => {
    const doc: DocConTransicion = { startViewTransition: () => undefined };
    expect(soportaViewTransition(doc)).toBe(true);
  });
});

describe('aplicarTransicion', () => {
  it('usa la API nativa cuando esta disponible y le pasa el callback', () => {
    const fn = vi.fn();
    const start = vi.fn((cb: () => void | Promise<void>) => {
      void cb();
      return undefined;
    });
    const usado = aplicarTransicion({ startViewTransition: start }, fn);
    expect(usado).toBe(true);
    expect(start).toHaveBeenCalledTimes(1);
    expect(fn).toHaveBeenCalledTimes(1);
  });

  it('cae al fallback ejecutando fn directamente', () => {
    const fn = vi.fn();
    const usado = aplicarTransicion({}, fn);
    expect(usado).toBe(false);
    expect(fn).toHaveBeenCalledTimes(1);
  });

  it('cae al fallback cuando el doc es undefined', () => {
    const fn = vi.fn();
    const usado = aplicarTransicion(undefined, fn);
    expect(usado).toBe(false);
    expect(fn).toHaveBeenCalledTimes(1);
  });
});
