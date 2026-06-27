import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { State } from 'ts-fsrs';
import { clearStore, get, put } from '../../core/storage';
import type { TarjetaUsuario } from '../vocab/types';
import type { Habilidad, RespuestaItem } from './diagnostic.logic';
import {
  DIAS_MAX,
  DIAS_MIN,
  construirCardReactivado,
  construirTarjetaReactivada,
  diasPorLatencia,
  sembrarReactivacion,
  tipoPorHabilidad,
} from './reactivacion';

const AHORA = new Date('2026-06-26T00:00:00Z');
const DIA_MS = 86_400_000;

function resp(
  lexemaId: string,
  habilidad: Habilidad,
  correcto: boolean,
  latenciaMs: number,
): RespuestaItem {
  return {
    habilidad,
    itemId: `${habilidad}:${lexemaId}`,
    lexemaId,
    dificultad: 5,
    correcto,
    latenciaMs,
  };
}

describe('tipoPorHabilidad', () => {
  it('mapea cada habilidad a su tipo de tarjeta (lectura no siembra)', () => {
    expect(tipoPorHabilidad('vocab')).toBe('recognition');
    expect(tipoPorHabilidad('escritura')).toBe('production');
    expect(tipoPorHabilidad('escucha')).toBe('listening');
    expect(tipoPorHabilidad('lectura')).toBeUndefined();
  });
});

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
  it('crea la tarjeta del tipo indicado con origen reactivacion', () => {
    const t = construirTarjetaReactivada('w_jingji', 'production', 1000, AHORA);
    expect(t.id).toBe('w_jingji:production');
    expect(t.lexemaId).toBe('w_jingji');
    expect(t.tipo).toBe('production');
    expect(t.origen).toBe('reactivacion');
  });
});

describe('sembrarReactivacion (multi-skill)', () => {
  beforeEach(async () => {
    await clearStore('cards');
  });
  afterEach(async () => {
    await clearStore('cards');
  });

  it('siembra el tipo correcto según la habilidad acertada', async () => {
    const sembradas = await sembrarReactivacion(
      [
        resp('w_a', 'vocab', true, 1000),
        resp('w_b', 'escritura', true, 1000),
        resp('w_c', 'escucha', true, 1000),
      ],
      AHORA,
    );
    expect(sembradas).toBe(3);
    expect(await get<TarjetaUsuario>('cards', 'w_a:recognition')).toBeDefined();
    expect(await get<TarjetaUsuario>('cards', 'w_b:production')).toBeDefined();
    expect(await get<TarjetaUsuario>('cards', 'w_c:listening')).toBeDefined();
  });

  it('no siembra fallos ni lectura (sin lexema)', async () => {
    const sembradas = await sembrarReactivacion(
      [
        resp('w_a', 'vocab', false, 1000),
        resp('', 'lectura', true, 1000),
        {
          habilidad: 'lectura',
          itemId: 'lectura:t1',
          lexemaId: '',
          dificultad: 5,
          correcto: true,
          latenciaMs: 1000,
        },
      ],
      AHORA,
    );
    expect(sembradas).toBe(0);
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

    const sembradas = await sembrarReactivacion([resp('w_a', 'vocab', true, 5000)], AHORA);
    expect(sembradas).toBe(0);
    const tras = await get<TarjetaUsuario>('cards', 'w_a:recognition');
    expect(tras?.fsrs.stability).toBe(100);
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

    const sembradas = await sembrarReactivacion([resp('w_a', 'vocab', true, 0)], AHORA);
    expect(sembradas).toBe(1);
    const tras = await get<TarjetaUsuario>('cards', 'w_a:recognition');
    expect(tras?.fsrs.stability).toBe(DIAS_MAX);
    expect(tras?.origen).toBe('reactivacion');
  });

  it('es idempotente: re-sembrar no duplica ni degrada', async () => {
    await sembrarReactivacion([resp('w_a', 'vocab', true, 0)], AHORA);
    const segunda = await sembrarReactivacion([resp('w_a', 'vocab', true, 0)], AHORA);
    expect(segunda).toBe(0); // misma estabilidad -> no re-escribe
  });
});
