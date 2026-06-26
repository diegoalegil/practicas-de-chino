import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { clearStore, del, get, getAll, put, putAll, resetDbCache } from './storage';

interface Fila {
  id: string;
  valor: number;
}

beforeEach(() => {
  resetDbCache();
});

afterEach(async () => {
  await clearStore('progress');
});

describe('storage (IndexedDB)', () => {
  it('guarda y recupera un registro', async () => {
    await put<Fila>('progress', { id: 'a', valor: 1 });
    const fila = await get<Fila>('progress', 'a');
    expect(fila?.valor).toBe(1);
  });

  it('devuelve undefined si la clave no existe', async () => {
    expect(await get<Fila>('progress', 'no-existe')).toBeUndefined();
  });

  it('guarda en lote y los lista todos', async () => {
    await putAll<Fila>('progress', [
      { id: 'x', valor: 10 },
      { id: 'y', valor: 20 },
    ]);
    const todos = await getAll<Fila>('progress');
    expect(todos.map((f) => f.id).sort()).toEqual(['x', 'y']);
  });

  it('elimina un registro', async () => {
    await put<Fila>('progress', { id: 'z', valor: 9 });
    await del('progress', 'z');
    expect(await get<Fila>('progress', 'z')).toBeUndefined();
  });
});
