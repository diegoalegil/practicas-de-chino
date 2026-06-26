import { describe, expect, it, vi } from 'vitest';
import { createStore } from './store';

describe('createStore', () => {
  it('expone el estado inicial', () => {
    const store = createStore({ n: 0 });
    expect(store.get()).toEqual({ n: 0 });
  });

  it('notifica a los suscriptores con el estado inicial y los cambios', () => {
    const store = createStore({ n: 0 });
    const listener = vi.fn();
    store.subscribe(listener);
    expect(listener).toHaveBeenCalledWith({ n: 0 });
    store.set({ n: 1 });
    expect(listener).toHaveBeenLastCalledWith({ n: 1 });
  });

  it('acepta una función actualizadora', () => {
    const store = createStore(1);
    store.set((prev) => prev + 1);
    expect(store.get()).toBe(2);
  });

  it('deja de notificar tras desuscribirse', () => {
    const store = createStore(0);
    const listener = vi.fn();
    const unsubscribe = store.subscribe(listener);
    unsubscribe();
    store.set(5);
    expect(listener).toHaveBeenCalledTimes(1); // sólo la llamada inicial
  });
});
