import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { clearStore, get, put, resetDbCache } from '../../core/storage';
import { agregarLexemaAlSrs, idTarjetaReconocimiento } from './agregar';
import type { TarjetaUsuario } from './types';

const STORE = 'cards';

beforeEach(() => {
  resetDbCache();
});

afterEach(async () => {
  await clearStore(STORE);
});

describe('agregarLexemaAlSrs', () => {
  it('crea una tarjeta recognition persistida para el lexema', async () => {
    const ahora = new Date('2026-06-27T10:00:00Z');
    const creada = await agregarLexemaAlSrs('w_hangban', ahora);

    expect(creada).toBe(true);
    const tarjeta = await get<TarjetaUsuario>(STORE, idTarjetaReconocimiento('w_hangban'));
    expect(tarjeta).toBeDefined();
    expect(tarjeta?.lexemaId).toBe('w_hangban');
    expect(tarjeta?.tipo).toBe('recognition');
    expect(tarjeta?.origen).toBe('nuevo');
    expect(tarjeta?.fsrs.reps).toBe(0);
  });

  it('usa la clave canónica `${lexemaId}:recognition`', () => {
    expect(idTarjetaReconocimiento('w_xiazai')).toBe('w_xiazai:recognition');
  });

  it('es idempotente: no sobrescribe una tarjeta existente', async () => {
    const ahora = new Date('2026-06-27T10:00:00Z');
    await agregarLexemaAlSrs('w_pingmu', ahora);

    // Simula estado FSRS avanzado tras repasos.
    const id = idTarjetaReconocimiento('w_pingmu');
    const existente = await get<TarjetaUsuario>(STORE, id);
    expect(existente).toBeDefined();
    if (!existente) {
      throw new Error('tarjeta esperada');
    }
    const conRepasos: TarjetaUsuario = {
      ...existente,
      fsrs: { ...existente.fsrs, reps: 5 },
    };
    await put<TarjetaUsuario>(STORE, conRepasos);

    const masTarde = new Date('2026-07-01T10:00:00Z');
    const creadaDeNuevo = await agregarLexemaAlSrs('w_pingmu', masTarde);

    expect(creadaDeNuevo).toBe(false);
    const tras = await get<TarjetaUsuario>(STORE, id);
    expect(tras?.fsrs.reps).toBe(5);
  });
});
