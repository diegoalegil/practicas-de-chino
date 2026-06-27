import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { clearStore, get, getAll, put, resetDbCache } from '../../core/storage';
import {
  esCopiaValida,
  exportarDatos,
  importarDatos,
  nombreArchivoCopia,
  parsearCopia,
  resetearDatos,
  type CopiaSeguridad,
} from './backup';

interface Fila {
  id: string;
  valor: number;
}

beforeEach(() => {
  resetDbCache();
});

afterEach(async () => {
  await clearStore('cards');
  await clearStore('reviews');
  await clearStore('progress');
});

describe('esCopiaValida', () => {
  it('acepta una copia bien formada', () => {
    const copia: CopiaSeguridad = {
      app: 'practicas-de-chino',
      version: 1,
      exportadoEn: new Date().toISOString(),
      datos: { cards: [], reviews: [], progress: [] },
    };
    expect(esCopiaValida(copia)).toBe(true);
  });

  it('rechaza objetos sin marca o con versión distinta', () => {
    expect(esCopiaValida(null)).toBe(false);
    expect(esCopiaValida({})).toBe(false);
    expect(esCopiaValida({ app: 'otra', version: 1, datos: {} })).toBe(false);
    expect(esCopiaValida({ app: 'practicas-de-chino', version: 2, datos: {} })).toBe(false);
  });

  it('rechaza datos que no sean arrays', () => {
    expect(esCopiaValida({ app: 'practicas-de-chino', version: 1, datos: { cards: 'x' } })).toBe(
      false,
    );
  });
});

describe('parsearCopia', () => {
  it('lanza con JSON inválido', () => {
    expect(() => parsearCopia('{no-json')).toThrow();
  });

  it('lanza con una copia de otra app', () => {
    expect(() => parsearCopia(JSON.stringify({ app: 'otra' }))).toThrow();
  });

  it('parsea una copia válida', () => {
    const copia: CopiaSeguridad = {
      app: 'practicas-de-chino',
      version: 1,
      exportadoEn: 'x',
      datos: { cards: [], reviews: [], progress: [] },
    };
    expect(parsearCopia(JSON.stringify(copia)).version).toBe(1);
  });
});

describe('exportar / importar (round-trip)', () => {
  it('exporta todos los stores', async () => {
    await put<Fila>('progress', { id: 'p1', valor: 7 });
    const copia = await exportarDatos();
    expect(copia.app).toBe('practicas-de-chino');
    expect(copia.datos['progress']).toEqual([{ id: 'p1', valor: 7 }]);
    expect(copia.datos['cards']).toEqual([]);
  });

  it('importar reemplaza el contenido de los stores', async () => {
    await put<Fila>('progress', { id: 'viejo', valor: 1 });
    const copia: CopiaSeguridad = {
      app: 'practicas-de-chino',
      version: 1,
      exportadoEn: 'x',
      datos: { cards: [], reviews: [], progress: [{ id: 'nuevo', valor: 99 }] },
    };
    await importarDatos(copia);
    expect(await get<Fila>('progress', 'viejo')).toBeUndefined();
    expect(await get<Fila>('progress', 'nuevo')).toEqual({ id: 'nuevo', valor: 99 });
  });
});

describe('resetearDatos', () => {
  it('vacía todos los stores', async () => {
    await put<Fila>('progress', { id: 'p1', valor: 1 });
    await resetearDatos();
    expect(await getAll('progress')).toEqual([]);
  });
});

describe('nombreArchivoCopia', () => {
  it('incluye la fecha ISO', () => {
    const nombre = nombreArchivoCopia(new Date('2026-06-27T10:00:00Z'));
    expect(nombre).toBe('practicas-de-chino-copia-2026-06-27.json');
  });
});
