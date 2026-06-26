import { describe, expect, it } from 'vitest';
import { matchRoute, normalizeHash, type Route } from './router';

const routes: Route[] = [
  {
    path: '/',
    title: 'Inicio',
    label: 'Inicio',
    hanzi: '家',
    tab: true,
    load: () => ({ mount: () => undefined }),
  },
  {
    path: '/vocabulario',
    title: 'Vocabulario',
    label: 'Vocab',
    hanzi: '词',
    tab: true,
    load: () => ({ mount: () => undefined }),
  },
];

describe('normalizeHash', () => {
  it('devuelve el fallback cuando el hash está vacío', () => {
    expect(normalizeHash('', '/')).toBe('/');
    expect(normalizeHash('#', '/')).toBe('/');
  });

  it('quita el # inicial', () => {
    expect(normalizeHash('#/vocabulario', '/')).toBe('/vocabulario');
  });
});

describe('matchRoute', () => {
  it('encuentra la ruta por path', () => {
    expect(matchRoute('#/vocabulario', routes, '/')?.path).toBe('/vocabulario');
  });

  it('cae al fallback si no hay coincidencia', () => {
    expect(matchRoute('#/no-existe', routes, '/')?.path).toBe('/');
  });
});
