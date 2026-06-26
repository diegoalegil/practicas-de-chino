import type { View } from '../../types';

export function createProgressView(): View {
  return {
    mount(root) {
      root.textContent = 'Progreso · en construcción';
    },
  };
}
