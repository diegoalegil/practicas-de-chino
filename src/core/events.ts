export type Unsubscribe = () => void;

/** Bus de eventos tipado y mínimo (sin dependencias). */
export class EventBus<Events extends Record<string, unknown>> {
  private readonly listeners: {
    [K in keyof Events]?: Set<(payload: Events[K]) => void>;
  } = {};

  on<K extends keyof Events>(event: K, listener: (payload: Events[K]) => void): Unsubscribe {
    const set = (this.listeners[event] ??= new Set());
    set.add(listener);
    return () => set.delete(listener);
  }

  emit<K extends keyof Events>(event: K, payload: Events[K]): void {
    this.listeners[event]?.forEach((listener) => {
      listener(payload);
    });
  }
}
