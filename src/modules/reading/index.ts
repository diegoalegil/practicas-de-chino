import type { View } from '../../types';

export function createReadingView(): View {
  return {
    mount(root) {
      root.textContent = 'Lectura · en construcción';
    },
  };
}
