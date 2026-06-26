import { describe, expect, it, vi } from 'vitest';
import { hablar, hayVozChina, vozDisponible } from './audio';

describe('audio (Web Speech)', () => {
  it('detecta el soporte de voz (mock disponible en tests)', () => {
    expect(vozDisponible()).toBe(true);
  });

  it('sin voces instaladas, hayVozChina es false', () => {
    expect(hayVozChina()).toBe(false);
  });

  it('hablar invoca speechSynthesis.speak con el texto', () => {
    const speak = vi.spyOn(globalThis.speechSynthesis, 'speak');
    hablar('经济');
    expect(speak).toHaveBeenCalledTimes(1);
    speak.mockRestore();
  });
});
