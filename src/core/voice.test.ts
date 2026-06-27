import { afterEach, describe, expect, it, vi } from 'vitest';
import { detectarVozChina, esperarVozChina, GUIA_VOZ_IOS } from './voice';

interface VozFalsa {
  name: string;
  lang: string;
}

/** Construye un mock mínimo de SpeechSynthesisVoice. */
function voz(name: string, lang: string): VozFalsa {
  return { name, lang };
}

/**
 * Sustituye globalThis.speechSynthesis por un mock con getVoices controlado y
 * gestión de listeners de `voiceschanged`. Devuelve utilidades para disparar el
 * evento y poblar voces después.
 */
function montarSintesis(vocesIniciales: VozFalsa[]) {
  let voces = vocesIniciales;
  const listeners = new Set<() => void>();
  const synth = {
    getVoices: () => voces,
    addEventListener: (tipo: string, cb: () => void) => {
      if (tipo === 'voiceschanged') {
        listeners.add(cb);
      }
    },
    removeEventListener: (tipo: string, cb: () => void) => {
      if (tipo === 'voiceschanged') {
        listeners.delete(cb);
      }
    },
  };
  Object.defineProperty(globalThis, 'speechSynthesis', {
    value: synth,
    writable: true,
    configurable: true,
  });
  return {
    poblar(nuevas: VozFalsa[]): void {
      voces = nuevas;
      for (const cb of listeners) {
        cb();
      }
    },
    listeners,
  };
}

const setupOriginal = Object.getOwnPropertyDescriptor(globalThis, 'speechSynthesis');

afterEach(() => {
  vi.useRealTimers();
  if (setupOriginal) {
    Object.defineProperty(globalThis, 'speechSynthesis', setupOriginal);
  }
});

describe('voice — detectarVozChina', () => {
  it('sin voces instaladas, devuelve no disponible', () => {
    montarSintesis([]);
    expect(detectarVozChina()).toEqual({ disponible: false });
  });

  it('detecta una voz china genérica (zh-*)', () => {
    montarSintesis([voz('Google 普通话', 'zh-TW')]);
    expect(detectarVozChina()).toEqual({ disponible: true, voz: 'Google 普通话' });
  });

  it('prefiere Ting-Ting sobre otras voces zh', () => {
    montarSintesis([voz('Otra', 'zh-CN'), voz('Ting-Ting', 'zh-CN'), voz('Daniel', 'en-GB')]);
    expect(detectarVozChina()).toEqual({ disponible: true, voz: 'Ting-Ting' });
  });

  it('prefiere zh-CN sobre otra variante zh cuando no hay Ting-Ting', () => {
    montarSintesis([voz('Mei-Jia', 'zh-TW'), voz('Li-mu', 'zh-CN')]);
    expect(detectarVozChina()).toEqual({ disponible: true, voz: 'Li-mu' });
  });

  it('ignora voces no chinas', () => {
    montarSintesis([voz('Daniel', 'en-GB'), voz('Mónica', 'es-ES')]);
    expect(detectarVozChina()).toEqual({ disponible: false });
  });

  it('sin soporte de voz, devuelve no disponible', () => {
    // @ts-expect-error: forzamos la ausencia de la API.
    delete globalThis.speechSynthesis;
    expect(detectarVozChina()).toEqual({ disponible: false });
  });
});

describe('voice — esperarVozChina', () => {
  it('resuelve de inmediato si ya hay voces cargadas', async () => {
    montarSintesis([voz('Ting-Ting', 'zh-CN')]);
    await expect(esperarVozChina()).resolves.toEqual({ disponible: true, voz: 'Ting-Ting' });
  });

  it('espera al evento voiceschanged si las voces llegan tarde', async () => {
    const synth = montarSintesis([]);
    const promesa = esperarVozChina(5000);
    // Simula la carga asíncrona de voces típica de iOS/Safari.
    synth.poblar([voz('Ting-Ting', 'zh-CN')]);
    await expect(promesa).resolves.toEqual({ disponible: true, voz: 'Ting-Ting' });
    expect(synth.listeners.size).toBe(0); // listener limpiado tras resolver
  });

  it('resuelve con no disponible tras el timeout si nunca llegan voces', async () => {
    vi.useFakeTimers();
    montarSintesis([]);
    const promesa = esperarVozChina(1500);
    await vi.advanceTimersByTimeAsync(1500);
    await expect(promesa).resolves.toEqual({ disponible: false });
  });

  it('sin soporte de voz, resuelve no disponible', async () => {
    // @ts-expect-error: forzamos la ausencia de la API.
    delete globalThis.speechSynthesis;
    await expect(esperarVozChina()).resolves.toEqual({ disponible: false });
  });
});

describe('voice — guía iOS', () => {
  it('menciona la ruta de Ajustes de iOS', () => {
    expect(GUIA_VOZ_IOS).toContain('Accesibilidad');
    expect(GUIA_VOZ_IOS).toContain('Contenido hablado');
    expect(GUIA_VOZ_IOS).toContain('Chino');
  });
});
