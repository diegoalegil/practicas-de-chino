import { describe, expect, it } from 'vitest';

describe('sanity', () => {
  it('la aritmética básica funciona', () => {
    expect(1 + 1).toBe(2);
  });

  it('el entorno jsdom y los mocks están disponibles', () => {
    expect(typeof globalThis.speechSynthesis).toBe('object');
    expect(typeof indexedDB).toBe('object');
  });
});
