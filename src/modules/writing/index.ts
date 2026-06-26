import type { View } from '../../types';

export function createWritingView(): View {
  return {
    mount(root) {
      root.textContent = 'Escritura · en construcción';
    },
  };
}
