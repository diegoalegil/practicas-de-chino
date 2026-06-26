import type { View } from '../../types';

export function createVocabView(): View {
  return {
    mount(root) {
      root.textContent = 'Vocabulario · en construcción';
    },
  };
}
