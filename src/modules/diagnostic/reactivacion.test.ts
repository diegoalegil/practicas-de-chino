import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { State } from 'ts-fsrs';
import { clearStore, get, put } from '../../core/storage';
import type { TarjetaUsuario } from '../vocab/types';
import type { RespuestaItem } from './diagnostic.logic';
import {
  DIAS_MAX,
  DIAS_MIN,
  construirCardReactivado,
  construirTarjetaReactivada,
  diasPorLatencia,
  sembrarReactivacion,
} from './reactivacion';

const AHORA = new Date('2026-06-26T00:00:00Z');
const DIA_MS = 86_400_000;

function resp(lexemaId: string, correcto: boolean, latenciaMs: number): RespuestaItem {
  return { lexemaId, dificultad: 5, correcto, latenciaMs };
}

describe('diasPorLatencia', () => {
  it('respuesta instantánea da la estabilidad máxima', () => {
    expect(diasPorLatencia(0)).toBe(DIAS_MAX);
  });

  it('respuesta muy lenta da la estabilidad mínima', () => {
    expect(diasPorLatencia(60_000)).toBe(DIAS_MIN);
  });

  it('está siempre dentro del rango [DIAS_MIN, DIAS_MAX]', () => {
    for (const lat of [0, 1500, 3000, 6000, 10000]) {
      const d = diasPorLatencia(lat);
      expect(d).toBeGreaterThanOrEqual(DIAS_MIN);
      expect(d).toBeLessThanOrEqual(DIAS_MAX);
    }
  });

  it('a más latencia, menos (o igual) estabilidad', () => {
    expect(diasPorLatencia(1000)).toBeGreaterThanOrEqual(diasPorLatencia(5000));
  });
});

describe('construirCardReactivado', () => {
  it('queda en estado Review con reps=1 y vencimiento en el futuro', () => {
    const card = construirCardReactivado(0, AHORA);
    expect(card.state).toBe(State.Review);
    expect(card.reps).toBe(1);
    expect(card.lapses).toBe(0);
    expect(card.last_review).toEqual(AHORA);
    expect(card.stability).toBe(DIAS_MAX);
    expect(card.scheduled_days).toBe(DIAS_MAX);
    expect(card.due.getTime()).toBe(AHORA.getTime() + DIAS_MAX * DIA_MS);
  });

  it('una respuesta lenta vence antes que una rápida', () => {
    const rapida = construirCardReactivado(0, AHORA);
    const lenta = construirCardReactivado(60_000, AHORA);
    expect(lenta.due.getTime()).toBeLessThan(rapida.due.getTime());
  });
});

describe('construirTarjetaReactivada', () => {
  it('crea la tarjeta de reconocimiento con origen reactivacion', () => {
    const t = construirTarjetaReactivada('w_jingji', 1000, AHORA);
    expect(t.id).toBe('w_jingji:recognition');
    expect(t.lexemaId).toBe('w_jingji');
    expect(t.tipo).toBe('recognition');
    expect(t.origen).toBe('reactivacion');
  });
});

describe('sembrarReactivacion', () => {
  beforeEach(async () => {
    await clearStore('cards');
  });
  afterEach(async () => {
    await clearStore('cards');
  });

  it('solo siembra los aciertos, no los fallos', async () => {
    const sembradas = await sembrarReactivacion(
      [resp('w_a', true, 1000), resp('w_b', false, 1000), resp('w_c', true, 2000)],
      AHORA,
    );
    expect(sembradas).toBe(2);
    expect(await get<TarjetaUsuario>('cards', 'w_a:recognition')).toBeDefined();
    expect(await get<TarjetaUsuario>('cards', 'w_b:recognition')).toBeUndefined();
    expect(await get<TarjetaUsuario>('cards', 'w_c:recognition')).toBeDefined();
  });

  it('no degrada una tarjeta existente con mayor estabilidad', async () => {
    const fuerte: TarjetaUsuario = {
      id: 'w_a:recognition',
      lexemaId: 'w_a',
      tipo: 'recognition',
      origen: 'nuevo',
      fsrs: { ...construirCardReactivado(0, AHORA), stability: 100 },
    };
    await put('cards', fuerte);

    const sembradas = await sembrarReactivacion([resp('w_a', true, 5000)], AHORA);
    expect(sembradas).toBe(0);
    const tras = await get<TarjetaUsuario>('cards', 'w_a:recognition');
    expect(tras?.fsrs.stability).toBe(100); // intacta
  });

  it('sí mejora una tarjeta nueva de baja estabilidad', async () => {
    const debil: TarjetaUsuario = {
      id: 'w_a:recognition',
      lexemaId: 'w_a',
      tipo: 'recognition',
      origen: 'nuevo',
      fsrs: { ...construirCardReactivado(0, AHORA), stability: 0.4 },
    };
    await put('cards', debil);

    const sembradas = await sembrarReactivacion([resp('w_a', true, 0)], AHORA);
    expect(sembradas).toBe(1);
    const tras = await get<TarjetaUsuario>('cards', 'w_a:recognition');
    expect(tras?.fsrs.stability).toBe(DIAS_MAX);
    expect(tras?.origen).toBe('reactivacion');
  });
});
