// Store reactivo mínimo (observable con pub/sub). Sin dependencias.

export type Listener<T> = (state: T) => void;
export type Updater<T> = (prev: T) => T;

export interface Store<T> {
  get(): T;
  set(next: T | Updater<T>): void;
  subscribe(listener: Listener<T>): () => void;
}

function isUpdater<T>(next: T | Updater<T>): next is Updater<T> {
  return typeof next === 'function';
}

export function createStore<T>(initial: T): Store<T> {
  let state = initial;
  const listeners = new Set<Listener<T>>();

  return {
    get: () => state,
    set: (next) => {
      state = isUpdater(next) ? next(state) : next;
      for (const listener of listeners) {
        listener(state);
      }
    },
    subscribe: (listener) => {
      listeners.add(listener);
      listener(state);
      return () => listeners.delete(listener);
    },
  };
}
