import type { View } from '../../types';

export function createDiagnosticView(): View {
  return {
    mount(root) {
      root.textContent = 'Diagnóstico · en construcción';
    },
  };
}
