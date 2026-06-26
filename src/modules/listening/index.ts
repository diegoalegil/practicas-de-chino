import type { View } from '../../types';

export function createListeningView(): View {
  return {
    mount(root) {
      root.textContent = 'Escucha · en construcción';
    },
  };
}
